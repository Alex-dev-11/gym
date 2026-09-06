using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

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

    [Column("role", TypeName = "system_role_enum")]
    public string Role { get; set; } = null!;
    public virtual ICollection<Visit> Visits { get; set; } = new List<Visit>();
}
