using GymApp.Api.Services.Employees;
using Microsoft.AspNetCore.Mvc;

namespace GymApp.Api.Controllers.Employees;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeesController(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    // GET: api/employees/trainers
    [HttpGet("trainers")]
    public async Task<IActionResult> GetActiveTrainers()
    {
        var trainers = await _employeeService.GetActiveTrainersAsync();
        return Ok(trainers);
    }
}