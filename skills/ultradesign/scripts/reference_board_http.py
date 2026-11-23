"""Anonymous, cached, rate-limited reads for the approved board adapters."""

import contextlib
import fcntl
import gzip
import hashlib
import io
from pathlib import Path
import re
import tempfile
import threading
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


AGENT = "UltradesignReferenceBoard/1.0"
INTERVAL = 2.05
TTL = 24 * 60 * 60
MAX_BYTES = 8 * 1024 * 1024


class AccessError(Exception):
    """A restriction, transport failure, or cold offline cache."""


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()[:32]


def save(path, data):
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as handle:
        handle.write(data)
        temporary = Path(handle.name)
    temporary.replace(path)


def robots_rules(text):
    groups = []
    agents, rules = [], []
    for line in text.splitlines():
        key, separator, value = line.split("#", 1)[0].partition(":")
        if not separator:
            continue
        key, value = key.strip().lower(), value.strip()
        if key == "user-agent":
            if rules:
                groups.append((agents, rules))
                agents, rules = [], []
            agents.append(value.lower())
        elif key in {"allow", "disallow", "crawl-delay"} and agents:
            rules.append((key, value))
    groups.append((agents, rules))
    name = AGENT.lower().split("/", 1)[0]
    matched = [rules for agents, rules in groups if name in agents]
    return [rule for rules in (matched or [r for a, r in groups if "*" in a]) for rule in rules]


def allowed_path(url, rules):
    parts = urlsplit(url)
    target = parts.path or "/"
    if parts.query:
        target += "?" + parts.query
    matches = []
    for kind, rule in rules:
        if kind not in {"allow", "disallow"} or not rule.startswith("/"):
            continue
        end = "$" if rule.endswith("$") else ""
        pattern = rule.removesuffix("$")
        if re.match(re.escape(pattern).replace(r"\*", ".*") + end, target):
            matches.append((len(pattern.replace("*", "")), kind == "allow"))
    return max(matches, default=(0, True))[1]


class PublicCache:
    def __init__(self, root, offline, rate_locks=None):
        self.root = root
        self.offline = offline
        self.responses = root / "responses"
        self.locks = root / "locks"
        self.rate_locks = rate_locks or self.locks
        self.images = root / "images"
        self.quota_stopped = threading.Event()
        for directory in (self.responses, self.locks, self.rate_locks, self.images):
            directory.mkdir(parents=True, exist_ok=True, mode=0o700)

    @contextlib.contextmanager
    def lock(self, key, directory):
        with (directory / digest(key)).open("a+") as handle:
            fcntl.flock(handle, fcntl.LOCK_EX)
            yield handle

    @staticmethod
    def host(url, source):
        parsed = urlsplit(url)
        if parsed.scheme != "https" or parsed.netloc.lower() not in source["hosts"]:
            raise AccessError(f"URL is outside this adapter's approved HTTPS origins: {url}")
        return parsed.netloc.lower()

    def request(self, url, host, scope, delay, *, robots=False):
        keys = sorted((f"host:{host}", f"site:{scope}"))
        with contextlib.ExitStack() as stack:
            clocks = [stack.enter_context(self.lock(key, self.rate_locks)) for key in keys]
            for clock in clocks:
                clock.seek(0)
            latest = max(float(clock.read().strip() or "0") for clock in clocks)
            hold = self.rate_locks / f"{digest(host)}.hold"
            if hold.is_file() and time.time() - hold.stat().st_mtime < TTL:
                raise AccessError(f"Site stopped after {hold.read_text()} (24h hold): {host}")
            if self.quota_stopped.is_set():
                raise AccessError("Provider quota stopped this run; no retry or alternate route")
            time.sleep(max(0, latest + delay - time.time()))
            try:
                if self.quota_stopped.is_set():
                    raise AccessError("Provider quota stopped this run; no retry or alternate route")
                return self.read_once(url, host, hold, robots)
            except AccessError as error:
                if "HTTP 429" in str(error):
                    self.quota_stopped.set()
                raise
            finally:
                finished = str(time.time())
                for clock in clocks:
                    clock.seek(0)
                    clock.truncate()
                    clock.write(finished)
                    clock.flush()

    @staticmethod
    def read_once(url, host, hold, robots):
        request = Request(url, headers={"User-Agent": AGENT, "Accept-Encoding": "identity"})
        try:
            with build_opener(NoRedirect).open(request, timeout=12) as response:
                if response.status != 200:
                    raise AccessError(f"HTTP {response.status}: {host} (possible access challenge)")
                data = response.read(MAX_BYTES + 1)
        except HTTPError as error:
            with error:
                if error.code in {301, 302, 303, 307, 308} and error.headers.get("Location"):
                    return None, urljoin(url, error.headers["Location"])
                if robots and error.code in {404, 410}:
                    return b"", None
                if error.code in {401, 403, 429, 451}:
                    save(hold, f"HTTP {error.code}".encode())
                raise AccessError(f"HTTP {error.code}: {url}") from error
        except (URLError, TimeoutError) as error:
            raise AccessError(f"Request failed: {url} ({error})") from error
        if data.startswith(b"\x1f\x8b"):
            try:
                with gzip.GzipFile(fileobj=io.BytesIO(data)) as stream:
                    data = stream.read(MAX_BYTES + 1)
            except (OSError, EOFError) as error:
                raise AccessError(f"Invalid compression: {url}") from error
        if len(data) > MAX_BYTES:
            raise AccessError(f"Response exceeds {MAX_BYTES // 1024**2} MiB: {url}")
        return data, None

    def entry(self, url, source, delay=INTERVAL, *, robots=False, max_age=TTL):
        host = self.host(url, source)
        key = digest(url)
        path = self.responses / key
        moved = self.responses / f"{key}.redirect"
        with self.lock("response:" + key, self.locks):
            if path.is_file() and (self.offline or time.time() - path.stat().st_mtime < max_age):
                return path.read_bytes(), None
            if moved.is_file() and (self.offline or time.time() - moved.stat().st_mtime < max_age):
                return None, moved.read_text()
            if self.offline:
                raise AccessError(f"No cached response: {url}")
            data, redirect = self.request(url, host, source["id"], delay, robots=robots)
            if data is not None:
                save(path, data)
                if moved.is_file():
                    moved.unlink()
            elif redirect:
                save(moved, redirect.encode())
                if path.is_file():
                    path.unlink()
            return data, redirect

    def policy(self, url, source):
        host = self.host(url, source)
        robots_url = f"https://{host}/robots.txt"
        data, redirect = self.entry(robots_url, source, robots=True)
        if redirect:
            if self.host(redirect, source) != host or urlsplit(redirect).path != "/robots.txt":
                raise AccessError(f"Unverified robots.txt redirect: {redirect}")
            data, redirect = self.entry(redirect, source, robots=True)
            if redirect:
                raise AccessError(f"Unverified robots.txt redirect: {redirect}")
        text = data.decode("utf-8-sig", errors="replace")
        if text.lstrip().startswith("<"):
            raise AccessError(f"Invalid robots.txt: {robots_url}")
        rules = robots_rules(text)
        if not allowed_path(url, rules):
            raise AccessError(f"robots.txt disallows {url}")
        delays = [float(value) for kind, value in rules
                  if kind == "crawl-delay" and re.fullmatch(r"\d+(?:\.\d+)?", value)]
        delay = max([INTERVAL, *delays])
        if delay > 30:
            raise AccessError(f"robots.txt crawl delay ({delay:g}s) exceeds this board's request budget")
        return delay

    def get(self, url, source, *, max_age=TTL):
        for _ in range(4):
            delay = self.policy(url, source)
            data, redirect = self.entry(url, source, delay, max_age=max_age)
            if not redirect:
                return data
            url = redirect
        raise AccessError(f"Too many redirects: {url}")

    def image(self, url, source):
        data = self.get(url, source, max_age=7 * TTL)
        if data.startswith(b"\x89PNG\r\n\x1a\n"):
            extension = "png"
        elif data.startswith(b"\xff\xd8\xff"):
            extension = "jpg"
        elif data.startswith(b"RIFF") and data[8:12] == b"WEBP":
            extension = "webp"
        elif data.startswith((b"GIF89a", b"GIF87a")):
            extension = "gif"
        elif data[4:12] == b"ftypavif":
            extension = "avif"
        else:
            raise AccessError(f"Not a supported raster preview: {url}")
        path = self.images / f"{digest(url)}.{extension}"
        if not path.is_file():
            save(path, data)
        return path
