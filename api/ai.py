# Vercel Python function: mounts the FastAPI AI service under /ai/*.
# The Node API proxies AI calls to <origin>/ai; this strips that prefix so
# FastAPI sees its native /api/v1/... routes.
import os
import sys

_here = os.path.dirname(os.path.abspath(__file__))
for _cand in (
    os.path.join(_here, 'ai-service'),
    os.path.join(_here, '..', 'ai-service'),
):
    if os.path.isdir(_cand):
        sys.path.insert(0, _cand)
        break

from app.main import app as _fastapi_app  # noqa: E402


class _PathTrim:
    def __init__(self, asgi_app, prefix='/ai'):
        self.asgi_app = asgi_app
        self.prefix = prefix

    async def __call__(self, scope, receive, send):
        if scope.get('type') == 'http' and scope.get('path', '').startswith(self.prefix):
            scope = dict(scope)
            scope['path'] = scope['path'][len(self.prefix):] or '/'
        return await self.asgi_app(scope, receive, send)


# `app` is the top-level entrypoint Vercel loads for api/*.py handlers
app = _PathTrim(_fastapi_app)
