from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException, RequestValidationError
from app.core.response import error_response
from app.core.logging import logger


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    logger.warning(f"HTTPException {exc.status_code}: {exc.detail} — {request.url}")
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(message=str(exc.detail)),
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    logger.warning(f"ValidationError at {request.url}: {errors}")
    return JSONResponse(
        status_code=422,
        content=error_response(message="Validation error", errors=errors),
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(f"Unhandled exception at {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content=error_response(message="Internal server error"),
    )
