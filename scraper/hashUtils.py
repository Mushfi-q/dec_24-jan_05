import hashlib
import json

def compute_snapshot_hash(snapshot_data: dict) -> str:
    """
    Computes a stable SHA256 hash for snapshot data.
    """
    serialized = json.dumps(snapshot_data, sort_keys=True)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()
