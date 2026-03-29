import math
from typing import Any
from sqlalchemy.orm import Query


def paginate(query: Query, page: int = 1, page_size: int = 20) -> dict:
    page_size = min(page_size, 100)
    page = max(page, 1)

    total = query.count()
    total_pages = math.ceil(total / page_size) if page_size > 0 else 0
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }
