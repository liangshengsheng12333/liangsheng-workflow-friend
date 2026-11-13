"""Read-only role-scope check used by the Liangsheng driver; not a platform sandbox."""
from pathlib import Path
import argparse
import json

REGISTRY = Path(__file__).resolve().parents[1] / 'references/岗位技能清单.json'
STAGES = ('discussion', 'prd', 'initialization', 'work', 'standalone', 'maintenance')

def check(role, skill, stage='work', advisor_enabled=False, registry=None):
    data = registry if registry is not None else json.loads(REGISTRY.read_text(encoding='utf-8'))
    skill = skill.removeprefix('liangsheng:')
    record = data['roles'].get(role)
    result = {'role': role, 'skill': skill, 'stage': stage, 'registry_version': data['version'], 'allowed': False}
    if record is None:
        return {**result, 'reason': 'unknown_role: read canonical role from the role card'}
    allowed_stages = {
        'DISCUSS': {'discussion'}, 'P00a': {'discussion', 'prd'}, 'P00b': {'initialization'},
        'P11': {'initialization', 'work'}, 'CURRENT': {'discussion', 'standalone', 'work'},
        'MAINTENANCE': {'discussion', 'maintenance'},
    }.get(role, {'work'})
    if stage not in allowed_stages:
        return {**result, 'reason': 'stage_not_ready: ordinary initialization is read-only check-in'}
    allowed = set(data['shared']) | set(record['skills'])
    conditional = data['conditional_advisor']
    if advisor_enabled and role in conditional['roles']:
        allowed.add(conditional['skill'])
    if skill not in allowed:
        return {**result, 'reason': 'outside_role_list: hand off to the responsible role'}
    # Dependencies must also belong to the same role, including transitive dependencies.
    pending = [skill]
    seen = set()
    while pending:
        current = pending.pop()
        if current in seen:
            continue
        seen.add(current)
        for dependency in data['dependencies'].get(current, []):
            if dependency not in allowed:
                return {**result, 'reason': 'dependency_outside_role_list', 'dependency': dependency}
            pending.append(dependency)
    return {**result, 'allowed': True, 'reason': 'role_and_stage_match',
            'required_skills': sorted(seen), 'authorization_check': 'driver must still verify task and user approval'}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--role', required=True)
    parser.add_argument('--skill', required=True)
    parser.add_argument('--stage', choices=STAGES, default='work')
    parser.add_argument('--advisor-enabled', action='store_true')
    args = parser.parse_args()
    result = check(args.role, args.skill, args.stage, args.advisor_enabled)
    print(json.dumps(result, ensure_ascii=False))
    return 0 if result['allowed'] else 2

if __name__ == '__main__':
    raise SystemExit(main())
