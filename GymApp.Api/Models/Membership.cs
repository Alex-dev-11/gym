using System;
using System.Collections.Generic;

namespace GymApp.Api.Models;

public partial class Membership
{
    public int Id { get; set; }

    public int ClientId { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public int TotalVisits { get; set; }

    public int UsedVisits { get; set; }

    public virtual Client Client { get; set; } = null!;

    public MembershipType Type { get; set; }
    public MembershipStatus Status { get; set; }

    public virtual ICollection<Visit> Visits { get; set; } = new List<Visit>();
}
