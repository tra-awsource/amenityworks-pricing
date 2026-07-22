/**
 * AmenityWorks Pricing — access control
 *
 * Only the HASH is stored here (not the password).
 * You cannot reverse the hash. To change the password:
 *   1. Open set-password.html on the live site or locally
 *   2. Type your new password → copy the hash
 *   3. Paste it below as passwordHash
 *   4. git add/commit/push
 *
 * Starter password (change this soon): ChangeMe-AW-2026
 */
window.AW_ACCESS = {
  // SHA-256 hex of the shared access password
  passwordHash:
    "9673ae3141dc03c1c8a34b5278e5219bd456fefa35dd384e8912b8074dc2f8e7",
  // How long the browser remembers a successful unlock (days)
  sessionDays: 30,
  // Storage key (change if you rotate everyone out at once)
  storageKey: "aw_pricing_access_v1",
};
