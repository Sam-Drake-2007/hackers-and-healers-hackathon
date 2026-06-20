from typing import Callable, Awaitable
from google.genai import types
from state import SessionState

# Handler signature: (FunctionCall, SessionState, send_to_browser) -> FunctionResponse
ToolHandler = Callable[
    [types.FunctionCall, "SessionState", Callable],
    Awaitable[types.FunctionResponse],
]

_registry: dict[str, ToolHandler] = {}


def register(name: str):
    def decorator(fn: ToolHandler) -> ToolHandler:
        _registry[name] = fn
        return fn
    return decorator


def get_handler(name: str) -> ToolHandler | None:
    return _registry.get(name)
