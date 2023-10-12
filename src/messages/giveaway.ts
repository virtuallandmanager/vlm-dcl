export default {
  // Message displayed when someone tries to claim a wearable from a guest account:
  noWallet: "Sorry, you must connect a wallet to claim this item.",

  // Message displayed while the claim is being processed:
  claimInProgress: "Claiming item...",

  // Message displayed after a successful claim:
  successfulClaim: "Success! Your item will appear in your backpack soon.",

  // Message displayed if the current time is before the event starts:
  beforeEventTime: "This item cannot be claimed yet.",

  // Message displayed if the event has ended:
  afterEventTime: "This item can no longer be claimed.",

  // Message displayed if someone tries to hit claim again after already making a claim:
  existingClaim:
    "We have received your claim and your item will appear in your backpack soon.",

  // Message displayed if someone has reached the limit for claims from one IP address:
  ipLimitReached: "This item can no longer be claimed.",

  // Message displayed if all items have been claimed:
  noSupply: "All of the giveaway items have been claimed.",

  // Message displayed if the server detects a VPN connection or other ways to circumvent the IP limit:
  inauthenticConnection: "VPN detected. Please disconnect to claim this item.",

  // Message displayed when some sort of error occurs on the back end:
  errorMessage: "Sorry, something went wrong.",
};
