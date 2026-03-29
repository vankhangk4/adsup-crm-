"""Unit tests for normalize_phone utility (B068)"""
import pytest
from app.core.phone import normalize_phone


def test_normalize_leading_zero():
    """0901234567 → +84901234567"""
    assert normalize_phone("0901234567") == "+84901234567"


def test_normalize_84_prefix():
    """84901234567 → +84901234567"""
    assert normalize_phone("84901234567") == "+84901234567"


def test_normalize_plus84_prefix():
    """+84901234567 stays the same"""
    assert normalize_phone("+84901234567") == "+84901234567"


def test_strip_spaces():
    """Spaces are removed"""
    assert normalize_phone("090 123 4567") == "+84901234567"


def test_strip_dashes():
    """Dashes are removed"""
    assert normalize_phone("090-123-4567") == "+84901234567"


def test_strip_dots():
    """Dots are removed"""
    assert normalize_phone("090.123.4567") == "+84901234567"


def test_strip_parentheses():
    """Parentheses are removed"""
    assert normalize_phone("(090)1234567") == "+84901234567"


def test_idempotent_zero_prefix():
    """Normalizing twice gives same result"""
    once = normalize_phone("0901234567")
    twice = normalize_phone(once)
    assert once == twice


def test_idempotent_plus84():
    """+84 prefix is idempotent"""
    once = normalize_phone("+84901234567")
    twice = normalize_phone(once)
    assert once == twice


def test_idempotent_with_spaces():
    """Normalizing a messy number twice is idempotent"""
    once = normalize_phone("090 123 4567")
    twice = normalize_phone(once)
    assert once == twice


def test_empty_string():
    """Empty string returns empty string"""
    assert normalize_phone("") == ""


def test_mixed_separators():
    """Mixed separators are all stripped"""
    assert normalize_phone("090 - 123.4567") == "+84901234567"
