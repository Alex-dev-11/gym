using System;
using System.Collections.Generic;

namespace GymApp.Api.Models;

public partial class SystemUser
{
    public int Id { get; set; }

    public int? EmployeeId { get; set; }

    public string Login { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Employee? Employee { get; set; }
    public SystemRole Role { get; set; }
    public virtual ICollection<Visit> Visits { get; set; } = new List<Visit>();
}
