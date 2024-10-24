export var VLMModeration;
(function (VLMModeration) {
    let BanActions;
    (function (BanActions) {
        BanActions[BanActions["WALL"] = 0] = "WALL";
        BanActions[BanActions["BLACKOUT"] = 1] = "BLACKOUT";
    })(BanActions = VLMModeration.BanActions || (VLMModeration.BanActions = {}));
    let BanWallType;
    (function (BanWallType) {
        BanWallType[BanWallType["BLACK"] = 0] = "BLACK";
        BanWallType[BanWallType["INVISIBLE"] = 1] = "INVISIBLE";
        BanWallType[BanWallType["MIRROR"] = 2] = "MIRROR";
    })(BanWallType = VLMModeration.BanWallType || (VLMModeration.BanWallType = {}));
    class Config {
        constructor(config) {
            this.sk = config.sk || "";
            if (!config) {
                return;
            }
            this.allowCertainWearables = config.allowCertainWearables || this.allowCertainWearables;
            this.banCertainWearables = config.banCertainWearables || this.banCertainWearables;
            this.allowCertainUsers = config.allowCertainUsers || this.allowCertainUsers;
            this.banCertainUsers = config.banCertainUsers || this.banCertainUsers;
            this.allowWeb3Only = config.allowWeb3Only || this.allowWeb3Only;
            this.allowedWearables = config.allowedWearables || this.allowedWearables;
            this.bannedWearables = config.bannedWearables || this.bannedWearables;
            this.bannedUsers = config.bannedUsers || this.bannedUsers;
            this.allowedUsers = config.allowedUsers || this.allowedUsers;
            this.banActions = config.banActions || this.banActions;
            this.banWallType = config.banWallType || this.banWallType;
        }
    }
    VLMModeration.Config = Config;
    class VLMConfig extends Config {
    }
    VLMModeration.VLMConfig = VLMConfig;
})(VLMModeration || (VLMModeration = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkxNTW9kZXJhdGlvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9WTE1Nb2RlcmF0aW9uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLEtBQVcsYUFBYSxDQTZDN0I7QUE3Q0QsV0FBaUIsYUFBYTtJQUM1QixJQUFZLFVBR1g7SUFIRCxXQUFZLFVBQVU7UUFDcEIsMkNBQUksQ0FBQTtRQUNKLG1EQUFRLENBQUE7SUFDVixDQUFDLEVBSFcsVUFBVSxHQUFWLHdCQUFVLEtBQVYsd0JBQVUsUUFHckI7SUFFRCxJQUFZLFdBSVg7SUFKRCxXQUFZLFdBQVc7UUFDckIsK0NBQUssQ0FBQTtRQUNMLHVEQUFTLENBQUE7UUFDVCxpREFBTSxDQUFBO0lBQ1IsQ0FBQyxFQUpXLFdBQVcsR0FBWCx5QkFBVyxLQUFYLHlCQUFXLFFBSXRCO0lBRUQsTUFBYSxNQUFNO1FBY2pCLFlBQVksTUFBaUI7WUFDM0IsSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ1osT0FBTztZQUNULENBQUM7WUFDRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztZQUN4RixJQUFJLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztZQUNsRixJQUFJLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztZQUM1RSxJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUN0RSxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNoRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztZQUN6RSxJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUN0RSxJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUMxRCxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQztZQUM3RCxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUN2RCxJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUM1RCxDQUFDO0tBQ0Y7SUEvQlksb0JBQU0sU0ErQmxCLENBQUE7SUFDRCxNQUFhLFNBQVUsU0FBUSxNQUFNO0tBQUk7SUFBNUIsdUJBQVMsWUFBbUIsQ0FBQTtBQUMzQyxDQUFDLEVBN0NnQixhQUFhLEtBQWIsYUFBYSxRQTZDN0IiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgbmFtZXNwYWNlIFZMTU1vZGVyYXRpb24ge1xyXG4gIGV4cG9ydCBlbnVtIEJhbkFjdGlvbnMge1xyXG4gICAgV0FMTCxcclxuICAgIEJMQUNLT1VULFxyXG4gIH1cclxuXHJcbiAgZXhwb3J0IGVudW0gQmFuV2FsbFR5cGUge1xyXG4gICAgQkxBQ0ssXHJcbiAgICBJTlZJU0lCTEUsXHJcbiAgICBNSVJST1IsXHJcbiAgfVxyXG5cclxuICBleHBvcnQgY2xhc3MgQ29uZmlnIHtcclxuICAgIHNrOiBzdHJpbmc7XHJcbiAgICBhbGxvd0NlcnRhaW5XZWFyYWJsZXM/OiBib29sZWFuO1xyXG4gICAgYmFuQ2VydGFpbldlYXJhYmxlcz86IGJvb2xlYW47XHJcbiAgICBhbGxvd0NlcnRhaW5Vc2Vycz86IGJvb2xlYW47XHJcbiAgICBiYW5DZXJ0YWluVXNlcnM/OiBib29sZWFuO1xyXG4gICAgYWxsb3dXZWIzT25seT86IGJvb2xlYW47XHJcbiAgICBhbGxvd2VkV2VhcmFibGVzPzogeyBjb250cmFjdEFkZHJlc3M6IHN0cmluZzsgaXRlbUlkOiBzdHJpbmcgfVtdO1xyXG4gICAgYmFubmVkV2VhcmFibGVzPzogeyBjb250cmFjdEFkZHJlc3M6IHN0cmluZzsgaXRlbUlkOiBzdHJpbmcgfVtdO1xyXG4gICAgYmFubmVkVXNlcnM/OiB7IHdhbGxldEFkZHJlc3M/OiBzdHJpbmc7IGRpc3BsYXlOYW1lPzogc3RyaW5nIH1bXTtcclxuICAgIGFsbG93ZWRVc2Vycz86IHsgd2FsbGV0QWRkcmVzcz86IHN0cmluZzsgZGlzcGxheU5hbWU/OiBzdHJpbmcgfVtdO1xyXG4gICAgYmFuQWN0aW9ucz86IEJhbkFjdGlvbnNbXTtcclxuICAgIGJhbldhbGxUeXBlPzogQmFuV2FsbFR5cGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBWTE1Db25maWcpIHtcclxuICAgICAgdGhpcy5zayA9IGNvbmZpZy5zayB8fCBcIlwiO1xyXG4gICAgICBpZiAoIWNvbmZpZykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmFsbG93Q2VydGFpbldlYXJhYmxlcyA9IGNvbmZpZy5hbGxvd0NlcnRhaW5XZWFyYWJsZXMgfHwgdGhpcy5hbGxvd0NlcnRhaW5XZWFyYWJsZXM7XHJcbiAgICAgIHRoaXMuYmFuQ2VydGFpbldlYXJhYmxlcyA9IGNvbmZpZy5iYW5DZXJ0YWluV2VhcmFibGVzIHx8IHRoaXMuYmFuQ2VydGFpbldlYXJhYmxlcztcclxuICAgICAgdGhpcy5hbGxvd0NlcnRhaW5Vc2VycyA9IGNvbmZpZy5hbGxvd0NlcnRhaW5Vc2VycyB8fCB0aGlzLmFsbG93Q2VydGFpblVzZXJzO1xyXG4gICAgICB0aGlzLmJhbkNlcnRhaW5Vc2VycyA9IGNvbmZpZy5iYW5DZXJ0YWluVXNlcnMgfHwgdGhpcy5iYW5DZXJ0YWluVXNlcnM7XHJcbiAgICAgIHRoaXMuYWxsb3dXZWIzT25seSA9IGNvbmZpZy5hbGxvd1dlYjNPbmx5IHx8IHRoaXMuYWxsb3dXZWIzT25seTtcclxuICAgICAgdGhpcy5hbGxvd2VkV2VhcmFibGVzID0gY29uZmlnLmFsbG93ZWRXZWFyYWJsZXMgfHwgdGhpcy5hbGxvd2VkV2VhcmFibGVzO1xyXG4gICAgICB0aGlzLmJhbm5lZFdlYXJhYmxlcyA9IGNvbmZpZy5iYW5uZWRXZWFyYWJsZXMgfHwgdGhpcy5iYW5uZWRXZWFyYWJsZXM7XHJcbiAgICAgIHRoaXMuYmFubmVkVXNlcnMgPSBjb25maWcuYmFubmVkVXNlcnMgfHwgdGhpcy5iYW5uZWRVc2VycztcclxuICAgICAgdGhpcy5hbGxvd2VkVXNlcnMgPSBjb25maWcuYWxsb3dlZFVzZXJzIHx8IHRoaXMuYWxsb3dlZFVzZXJzO1xyXG4gICAgICB0aGlzLmJhbkFjdGlvbnMgPSBjb25maWcuYmFuQWN0aW9ucyB8fCB0aGlzLmJhbkFjdGlvbnM7XHJcbiAgICAgIHRoaXMuYmFuV2FsbFR5cGUgPSBjb25maWcuYmFuV2FsbFR5cGUgfHwgdGhpcy5iYW5XYWxsVHlwZTtcclxuICAgIH1cclxuICB9XHJcbiAgZXhwb3J0IGNsYXNzIFZMTUNvbmZpZyBleHRlbmRzIENvbmZpZyB7IH1cclxufVxyXG4iXX0=