#!/usr/bin/env python3
"""
Create a new user + API key (or add a key for an existing user).

Usage (from apps/api with venv active):

  python scripts/create_api_key.py --email alice@example.com --name Alice
  python scripts/create_api_key.py --user-id user_dev --key-name ci

Prints the raw API key once. Store it securely; it cannot be recovered later.
"""

from __future__ import annotations

import argparse
import asyncio
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Allow `python scripts/create_api_key.py` from apps/api
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select

from app.config import get_settings
from app.db.models import ApiKey, User
from app.db.session import async_session_factory, init_db
from app.services.api_keys import (
    create_user_with_api_key,
    generate_api_key,
    hash_api_key,
)


async def main() -> int:
    parser = argparse.ArgumentParser(description="Create Gryphon API key")
    parser.add_argument("--email", default=None)
    parser.add_argument("--name", default=None, help="User display name")
    parser.add_argument("--user-id", default=None, help="Existing user id to attach a new key to")
    parser.add_argument("--key-name", default="default")
    parser.add_argument(
        "--raw-key",
        default=None,
        help="Optional fixed raw key (default: random gry_...)",
    )
    args = parser.parse_args()

    settings = get_settings()
    await init_db()

    async with async_session_factory() as session:
        if args.user_id:
            result = await session.execute(select(User).where(User.id == args.user_id))
            user = result.scalar_one_or_none()
            if user is None:
                print(f"User not found: {args.user_id}", file=sys.stderr)
                return 1
            raw = args.raw_key or generate_api_key()
            api_key = ApiKey(
                id=str(uuid.uuid4()),
                user_id=user.id,
                key_prefix=raw[:8],
                key_hash=hash_api_key(raw, settings.secret_key),
                name=args.key_name,
                created_at=datetime.now(timezone.utc),
            )
            session.add(api_key)
            await session.commit()
            print(f"user_id={user.id}")
            print(f"key_id={api_key.id}")
            print(f"key_prefix={api_key.key_prefix}")
            print(f"api_key={raw}")
            return 0

        user, api_key, raw = await create_user_with_api_key(
            session,
            email=args.email,
            name=args.name,
            key_name=args.key_name,
            raw_key=args.raw_key,
            settings=settings,
        )
        await session.commit()
        print(f"user_id={user.id}")
        print(f"email={user.email}")
        print(f"key_id={api_key.id}")
        print(f"key_prefix={api_key.key_prefix}")
        print(f"api_key={raw}")
        return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
