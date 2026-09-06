using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace GymApp.Api.Models;

public partial class Membership
{
    public int Id { get; set; }

    public int ClientId { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public int TotalVisits { get; set; }

    public int UsedVisits { get; set; }

    public virtual Client Client { get; set; } = null!;

    [Column("type", TypeName = "membership_type_enum")]
    public string Type { get; set; } = null!;

    [Column("status", TypeName = "membership_status_enum")]
    public string Status { get; set; } = null!;

    public virtual ICollection<Visit> Visits { get; set; } = new List<Visit>();
}
