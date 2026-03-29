import re


def normalize_phone(phone: str) -> str:
    """
    Normalize a Vietnamese phone number.
    - Strip whitespace, dots, dashes, parentheses, plus signs (except leading +84)
    - Normalize leading 0 to +84 prefix
    - Idempotent: calling twice returns the same result
    """
    if not phone:
        return phone

    # Remove whitespace
    p = phone.strip()

    # Remove common separators: spaces, dots, dashes, parentheses
    p = re.sub(r"[\s.\-()]", "", p)

    # Already normalized with +84
    if p.startswith("+84"):
        # Remove any remaining non-digit chars after +84
        digits = re.sub(r"\D", "", p[3:])
        return "+84" + digits

    # Remove leading +
    if p.startswith("+"):
        p = p[1:]

    # Remove all non-digit characters
    p = re.sub(r"\D", "", p)

    # Normalize 84xxxxxxxxx → +84xxxxxxxxx
    if p.startswith("84") and len(p) == 11:
        return "+84" + p[2:]

    # Normalize 0xxxxxxxxx → +84xxxxxxxxx
    if p.startswith("0") and len(p) == 10:
        return "+84" + p[1:]

    # Return as-is with + prefix if it looks like an international number
    if len(p) >= 10:
        return "+" + p

    return p
