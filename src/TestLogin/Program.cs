using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;

var client = new HttpClient { BaseAddress = new Uri("http://localhost:5193/") };
var login = new { username = "admin", password = "Admin@123" };

Console.WriteLine("Testing login...");
var response = await client.PostAsJsonAsync("api/Auth/login", login);
var content = await response.Content.ReadAsStringAsync();

Console.WriteLine($"Status: {response.StatusCode}");
Console.WriteLine($"Response: {content}");

if (response.IsSuccessStatusCode)
{
    var json = JsonDocument.Parse(content);
    var token = json.RootElement.GetProperty("accessToken").GetString();
    Console.WriteLine($"\n✅ Login successful!");
    Console.WriteLine($"Token: {token}");
}
else
{
    Console.WriteLine("\n❌ Login failed");
}
