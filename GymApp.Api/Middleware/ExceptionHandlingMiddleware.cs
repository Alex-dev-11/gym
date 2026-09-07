using System.Net;
using System.Text.Json;

namespace GymApp.Api.Middleware;

/// <summary>
/// Middleware для глобальной обработки исключений.
/// 
/// ═══════════════════════════════════════════════════════════════
/// КАК ЭТО РАБОТАЕТ:
/// ═══════════════════════════════════════════════════════════════
/// 
/// 1. Middleware перехватывает ВСЕ исключения, которые возникают в контроллерах и сервисах.
/// 2. Анализирует тип исключения и возвращает соответствующий HTTP-статус:
///    - KeyNotFoundException → HTTP 404 Not Found
///    - InvalidOperationException → HTTP 400 Bad Request
///    - UnauthorizedAccessException → HTTP 401 Unauthorized
///    - Другие исключения → HTTP 500 Internal Server Error
/// 3. Формирует JSON-ответ с сообщением об ошибке.
/// 
/// ═══════════════════════════════════════════════════════════════
/// ПРЕИМУЩЕСТВА:
/// ═══════════════════════════════════════════════════════════════
/// 
/// ✅ Не нужно писать try-catch в каждом методе контроллера
/// ✅ Централизованная обработка ошибок
/// ✅ Легко изменить формат ошибок (в одном месте)
/// ✅ Контроллеры становятся чище (только HTTP-логика)
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    /// <summary>
    /// Конструктор middleware.
    /// 
    /// RequestDelegate _next — это следующий компонент в pipeline.
    /// Если middleware не обработал запрос, он передаёт его дальше (_next).
    /// 
    /// ILogger — для логирования ошибок (полезно для отладки).
    /// </summary>
    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Метод InvokeAsync вызывается для каждого HTTP-запроса.
    /// </summary>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            // Пытаемся передать запрос следующему компоненту (контроллеру)
            await _next(context);
        }
        catch (Exception ex)
        {
            // Если возникло исключение — обрабатываем его
            await HandleExceptionAsync(context, ex);
        }
    }

    /// <summary>
    /// Метод обработки исключений.
    /// Анализирует тип исключения и возвращает соответствующий HTTP-ответ.
    /// </summary>
    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // Определяем HTTP-статус и сообщение в зависимости от типа исключения
        var statusCode = HttpStatusCode.InternalServerError; // По умолчанию 500
        var message = "Произошла внутренняя ошибка сервера";

        switch (exception)
        {
            case KeyNotFoundException:
                // Ресурс не найден (например, клиент с таким ID не существует)
                statusCode = HttpStatusCode.NotFound;
                message = exception.Message;
                break;

            case InvalidOperationException:
                // Бизнес-ошибка (например, нельзя удалить абонемент с посещениями)
                statusCode = HttpStatusCode.BadRequest;
                message = exception.Message;
                break;

            case UnauthorizedAccessException:
                // Неавторизованный доступ (пока не используем, но на будущее)
                statusCode = HttpStatusCode.Unauthorized;
                message = exception.Message;
                break;

            case ArgumentException:
                // Неверные аргументы (например, невалидные данные)
                statusCode = HttpStatusCode.BadRequest;
                message = exception.Message;
                break;

            default:
                // Неизвестные исключения — логируем для отладки
                _logger.LogError(exception, "Необработанное исключение: {Message}", exception.Message);
                message = "Произошла непредвиденная ошибка";
                break;
        }

        // Формируем JSON-ответ
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            error = message,
            statusCode = (int)statusCode
        };

        var jsonResponse = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(jsonResponse);
    }
}