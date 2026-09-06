using System;
using System.Collections.Generic;

namespace GymApp.Api.Models;

public partial class Visit
{
    public int Id { get; set; }

    public int MembershipId { get; set; }

    public int? TrainerId { get; set; }

    public int? ProcessedByUserId { get; set; }

    public DateTime VisitTime { get; set; }

    public virtual Membership Membership { get; set; } = null!;

    public virtual SystemUser? ProcessedByUser { get; set; }

    public virtual Employee? Trainer { get; set; }
}
