export type TEventConfig = {
  claimBufferStart: number;
  claimBufferEnd: number;
  endTime: Date | string;
  giveaway: boolean;
  giveawayItems: TGiveawayItem[];
  id: string;
  name: string;
  startTime: Date | string;
};

export type TGiveawayItem = {
  tokenId: number | string;
  claimAction: string;
  contractAddress: string;
  creditAccount: string;
  limit: number;
}