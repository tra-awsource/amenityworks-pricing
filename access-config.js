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
 * 
 */
window.AW_ACCESS = {
  // SHA-256 hex of the shared access password
  passwordHash:
    "ed230976b1cf12d4de8624428098f14c4c1c8a2510d16ef5ed95dbccdddfcb40",
  // How long the browser remembers a successful unlock (days)
  sessionDays: 30,
  // Storage key (change if you rotate everyone out at once)
  storageKey: "aw_pricing_access_v1",
};
