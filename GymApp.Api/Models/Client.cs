using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace GymApp.Api.Models;

public partial class Client
{
    public int Id { get; set; }

    public string LastName { get; set; } = null!;

    public string FirstName { get; set; } = null!;

    public string? Patronymic { get; set; }

    public string Phone { get; set; } = null!;

    public string? Email { get; set; }

    public DateTime? RegistrationDate { get; set; }

    public bool IsDeleted { get; set; }

    [Column("status", TypeName = "client_status_enum")]
    public string Status { get; set; } = null!;

    public virtual ICollection<Membership> Memberships { get; set; } = new List<Membership>();
}
