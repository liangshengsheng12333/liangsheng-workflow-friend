"""Coordinate browser access; stores only a transient workspace hash and owner."""
import argparse
import hashlib
import json
import os
from pathlib import Path


def lock_path(workspace, lock_root):
    canonical = os.path.normcase(str(Path(workspace).resolve()))
    digest = hashlib.sha256(canonical.encode('utf-8')).hexdigest()
    return lock_root/f'{digest}.json'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['acquire', 'status', 'release'])
    parser.add_argument('--workspace', required=True, type=Path)
    parser.add_argument('--lock-root', required=True, type=Path)
    parser.add_argument('--owner', required=True)
    args = parser.parse_args()
    if not args.workspace.is_absolute() or not args.workspace.is_dir():
        parser.error('workspace must be an existing absolute directory')
    if not args.lock_root.is_absolute():
        parser.error('lock-root must be absolute and shared by consulting windows')
    path = lock_path(args.workspace, args.lock_root)
    if args.action == 'acquire':
        path.parent.mkdir(parents=True, exist_ok=True)
        try:
            with path.open('x', encoding='utf-8') as f:
                json.dump({'owner':args.owner}, f, ensure_ascii=False)
        except FileExistsError:
            print(json.dumps({'ok':False, 'state':'busy'}, ensure_ascii=False))
            return 2
        print(json.dumps({'ok':True, 'state':'acquired'}, ensure_ascii=False))
        return 0
    if not path.exists():
        print(json.dumps({'ok':args.action == 'status', 'state':'free'}, ensure_ascii=False))
        return 0 if args.action == 'status' else 2
    data = json.loads(path.read_text(encoding='utf-8'))
    if args.action == 'status':
        print(json.dumps({'ok':True, 'state':'busy', 'owner':data['owner']}, ensure_ascii=False))
        return 0
    if data['owner'] != args.owner:
        print(json.dumps({'ok':False, 'state':'different-owner'}, ensure_ascii=False))
        return 2
    path.unlink()
    print(json.dumps({'ok':True, 'state':'released'}, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
