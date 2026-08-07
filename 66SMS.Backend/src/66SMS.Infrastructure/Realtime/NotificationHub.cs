using System.Security.Claims;
using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace _66SMS.Infrastructure.Realtime
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private static readonly JsonSerializerSettings ProfileJsonSettings = new()
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            NullValueHandling = NullValueHandling.Ignore,
        };

        private readonly ILogger<NotificationHub> logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            this.logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = GetUserId();
            if (!string.IsNullOrEmpty(userId))
                await Groups.AddToGroupAsync(Context.ConnectionId, NotificationConst.GROUP_USER_PREFIX + userId);

            var salonId = GetSalonIdFromClaims();
            if (salonId != null)
                await Groups.AddToGroupAsync(Context.ConnectionId, NotificationConst.GROUP_SALON_PREFIX + salonId);

            logger.LogInformation("SignalR connected user={UserId} salon={SalonId} conn={ConnectionId}", userId, salonId, Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public Task JoinSalon(int salonId)
        {
            logger.LogInformation("JoinSalon {SalonId} conn={ConnectionId}", salonId, Context.ConnectionId);
            return Groups.AddToGroupAsync(Context.ConnectionId, NotificationConst.GROUP_SALON_PREFIX + salonId);
        }

        public Task LeaveSalon(int salonId)
            => Groups.RemoveFromGroupAsync(Context.ConnectionId, NotificationConst.GROUP_SALON_PREFIX + salonId);

        private string? GetUserId()
        {
            return Context.UserIdentifier
                ?? Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? Context.User?.FindFirstValue("sub")
                ?? Context.User?.FindFirstValue("nameid");
        }

        private int? GetSalonIdFromClaims()
        {
            var profileJson = Context.User?.FindFirstValue(JwtClaimConst.Profile);
            if (string.IsNullOrEmpty(profileJson)) return null;

            var profile = JsonConvert.DeserializeObject<TokenUserProfileDto>(profileJson, ProfileJsonSettings);
            var salonId = profile?.StaffProfile?.SalonId;
            return salonId is > 0 ? salonId : null;
        }
    }
}
