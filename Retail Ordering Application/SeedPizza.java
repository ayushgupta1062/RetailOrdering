import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SeedPizza {

    private static final String BASE = "http://localhost:8080";
    private static final HttpClient client = HttpClient.newHttpClient();

    public static void main(String[] args) throws Exception {
        System.out.println("Logging in...");
        String loginPayload = "{\"email\": \"testadmin@retail.com\", \"password\": \"testadmin1234\"}";
        String loginResp = post("/api/auth/login", loginPayload, null);

        if (loginResp == null || !loginResp.contains("\"token\"")) {
            System.out.println("Login failed. Response: " + loginResp);
            System.exit(1);
        }

        String token = extractJsonValue(loginResp, "token");
        System.out.println("Logged in! Token obtained.");

        String[] pizzaHutProducts = {
            "{\"name\": \"Pan Pizza Margherita\", \"description\": \"Classic pan pizza with mozzarella and tomato sauce, served in signature pan style\", \"price\": 349.0, \"stockQuantity\": 30, \"category\": {\"id\": 1}, \"brand\": {\"id\": 4}, \"packagingInfo\": \"Box\", \"imageUrl\": \"https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80\"}",
            "{\"name\": \"Stuffed Crust Pepperoni\", \"description\": \"Pizza with cheese-stuffed crust and loaded pepperoni toppings\", \"price\": 499.0, \"stockQuantity\": 25, \"category\": {\"id\": 1}, \"brand\": {\"id\": 4}, \"packagingInfo\": \"Box\", \"imageUrl\": \"https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80\"}",
            "{\"name\": \"Chicken Supreme\", \"description\": \"Loaded with grilled chicken, onions, capsicum and olives on a creamy base\", \"price\": 549.0, \"stockQuantity\": 20, \"category\": {\"id\": 1}, \"brand\": {\"id\": 4}, \"packagingInfo\": \"Box\", \"imageUrl\": \"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80\"}"
        };

        String[] lapinozProducts = {
            "{\"name\": \"La Americano\", \"description\": \"Chunky chicken with jalapenos, red paprika and extra cheese on fresh dough\", \"price\": 279.0, \"stockQuantity\": 35, \"category\": {\"id\": 1}, \"brand\": {\"id\": 5}, \"packagingInfo\": \"Box\", \"imageUrl\": \"https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=400&q=80\"}",
            "{\"name\": \"BBQ Paneer Tikka\", \"description\": \"Smoky BBQ base with paneer tikka, onions and capsicum — a desi favourite\", \"price\": 319.0, \"stockQuantity\": 40, \"category\": {\"id\": 1}, \"brand\": {\"id\": 5}, \"packagingInfo\": \"Box\", \"imageUrl\": \"https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&q=80\"}"
        };

        System.out.println("Adding new pizza products...");

        for (String prod : pizzaHutProducts) {
            addPizza(prod, token);
        }

        for (String prod : lapinozProducts) {
            addPizza(prod, token);
        }

        System.out.println("Done! All products added.");
    }

    private static void addPizza(String prod, String token) {
        String resp = post("/api/products", prod, token);
        if (resp != null && resp.contains("\"success\":true")) {
            System.out.println("  Added: " + extractJsonValue(resp, "name") + " (id=" + extractJsonValue(resp, "id", false) + ")");
        } else {
            System.out.println("  FAILED to add: " + extractJsonValue(prod, "name") + " -> " + resp);
        }
    }

    private static String post(String path, String payload, String token) {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(BASE + path))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload));

            if (token != null) {
                builder.header("Authorization", "Bearer " + token);
            }

            HttpRequest request = builder.build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            return null;
        }
    }

    private static String extractJsonValue(String json, String key) {
        return extractJsonValue(json, key, true);
    }

    private static String extractJsonValue(String json, String key, boolean isString) {
        String patternStr = isString ? "\"" + key + "\"\\s*:\\s*\"(.*?)\"" : "\"" + key + "\"\\s*:\\s*([0-9]+)";
        Pattern pattern = Pattern.compile(patternStr);
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return "null";
    }
}
