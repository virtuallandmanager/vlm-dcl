export default {
  // Message displayed when someone tries to claim a wearable from a guest account:
  noWallet: 'Sorry, you must connect a wallet to claim this item.',

  // Message displayed while the claim is being processed:
  claimSubmitted: 'Claiming item...',

  // Message displayed while the claim is being processed:
  claimInProgress: 'Your claim is still being processed...',

  // Message displayed after a successful claim:
  successfulClaim: 'Success!\nYour item will appear in your backpack soon.',

  // Message displayed if the current time is before the event starts:
  beforeEventTime: 'This item cannot be claimed yet.',

  // Message displayed if the event has ended:
  afterEventTime: 'This item can no longer be claimed.',

  // Message displayed if someone tries to hit claim again after already making a claim:
  existingClaim: "You've already claimed this giveaway.\nYour item should appear in your backpack soon.",

  // Message displayed if someone tries to hit claim again after their wearable was already delivered:
  claimComplete: "Your item was sent!.\nIf it's not in your backpack, try refreshing.",

  // Message displayed if a daily limit has been reached:
  dailyLimitReached: 'All of the giveaway items for today have been claimed.\nPlease try again tomorrow.',

  // Message displayed if a daily limit has been reached:
  otherLimitReached: 'Sorry, this giveaway item has reached its limit for now.\nPlease try again later.',

  // Message displayed if someone has reached the limit for claims from one IP address:
  ipLimitReached: 'This item can no longer be claimed.',

  // Message displayed if all items have been claimed:
  noSupply: 'All of the giveaway items have been claimed.',

  // Message displayed if the server detects a VPN connection or other ways to circumvent the IP limit:
  inauthenticConnection: 'VPN detected.\nPlease disconnect to claim this item.',

  // Message displayed if the server cannot find a linked event for the giveaway:
  noLinkedEvents: 'No linked events have been found for this giveaway.',

  // Message displayed if the giveaway is paused:
  paused: 'This giveaway is currently paused.',

  // Generic default message displayed if the server rejects the claim for some other reason:
  claimDenied: 'Sorry, you are not eligible to claim this item.',

  // Message displayed when some sort of error occurs on the back end:
  errorMessage: 'Sorry, something went wrong.',
}
