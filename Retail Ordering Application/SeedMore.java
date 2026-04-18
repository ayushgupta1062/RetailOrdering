import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SeedMore {

    private static final String BASE = "http://localhost:8080";
    private static final HttpClient client = HttpClient.newHttpClient();

    public static void main(String[] args) throws Exception {
        System.out.println("Logging in...");
        String loginPayload = "{\"email\": \"testadmin@retail.com\", \"password\": \"testadmin1234\"}";
        String loginResp = post("/api/auth/login", loginPayload, null);

        if (loginResp == null || !loginResp.contains("\"token\"")) {
            System.out.println("Failed to login");
            System.exit(1);
        }

        String token = extractJsonValue(loginResp, "token");

        // Step 2: Add New Brands
        String[] brands = {
            "{\"name\": \"Coca-Cola\", \"description\": \"The classic cola brand\"}",
            "{\"name\": \"Sprite\", \"description\": \"Clear lime flavored soda\"}",
            "{\"name\": \"English Oven\", \"description\": \"Premium breads and bakery products\"}",
            "{\"name\": \"Harvest Gold\", \"description\": \"Daily fresh breads\"}"
        };

        System.out.println("\nAdding new brands...");
        Map<String, String> brandIds = new HashMap<>();
        for (String b : brands) {
            String resp = post("/api/brands", b, token);
            if (resp != null && resp.contains("\"success\":true")) {
                String name = extractJsonValue(resp, "name");
                String id = extractJsonValue(resp, "id", false);
                System.out.println("  Added brand " + name + " with ID " + id);
                brandIds.put(name, id);
            } else {
                System.out.println("  Failed to add brand: " + b);
            }
        }

        brandIds.put("Pepsi", "2");
        brandIds.put("Britannia", "3");

        int categoryColdDrinks = 2;
        int categoryBreads = 3;

        // Step 3: Add Products
        String[] products = {
            // Cold Drinks
            "{\"name\": \"Coca-Cola Original 750ml\", \"description\": \"Refreshing original cola taste\", \"price\": 40.0, \"stockQuantity\": 100, \"category\": {\"id\": " + categoryColdDrinks + "}, \"brand\": {\"id\": " + brandIds.get("Coca-Cola") + "}, \"packagingInfo\": \"Bottle\", \"imageUrl\": \"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80\"}",
            "{\"name\": \"Sprite Clear Lime 750ml\", \"description\": \"Crisp, refreshing and clean tasting lime soda\", \"price\": 40.0, \"stockQuantity\": 120, \"category\": {\"id\": " + categoryColdDrinks + "}, \"brand\": {\"id\": " + brandIds.get("Sprite") + "}, \"packagingInfo\": \"Bottle\", \"imageUrl\": \"https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&q=80\"}",
            "{\"name\": \"Pepsi Can 330ml\", \"description\": \"Enjoy the classic Pepsi taste in a convenient can\", \"price\": 35.0, \"stockQuantity\": 200, \"category\": {\"id\": " + categoryColdDrinks + "}, \"brand\": {\"id\": " + brandIds.get("Pepsi") + "}, \"packagingInfo\": \"Can\", \"imageUrl\": \"https://images.unsplash.com/photo-1546624538-4a1edfa0c410?w=400&q=80\"}",
            // Breads
            "{\"name\": \"Britannia 100% Whole Wheat Bread\", \"description\": \"Healthy and soft whole wheat bread packed with fiber\", \"price\": 50.0, \"stockQuantity\": 80, \"category\": {\"id\": " + categoryBreads + "}, \"brand\": {\"id\": " + brandIds.get("Britannia") + "}, \"packagingInfo\": \"Packet\", \"imageUrl\": \"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80\"}",
            "{\"name\": \"English Oven Sandwich Bread\", \"description\": \"Large slice premium bread perfect for sandwiches\", \"price\": 55.0, \"stockQuantity\": 60, \"category\": {\"id\": " + categoryBreads + "}, \"brand\": {\"id\": " + brandIds.get("English Oven") + "}, \"packagingInfo\": \"Packet\", \"imageUrl\": \"https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&q=80\"}",
            "{\"name\": \"Harvest Gold Burger Buns\", \"description\": \"Soft and fluffy burger buns topped with sesame seeds\", \"price\": 45.0, \"stockQuantity\": 40, \"category\": {\"id\": " + categoryBreads + "}, \"brand\": {\"id\": " + brandIds.get("Harvest Gold") + "}, \"packagingInfo\": \"Packet of 4\", \"imageUrl\": \"https://images.unsplash.com/photo-1550508139-83a903341ed4?w=400&q=80\"}"
        };

        System.out.println("\nAdding new products...");
        for (String prod : products) {
            String resp = post("/api/products", prod, token);
            if (resp != null && resp.contains("\"success\":true")) {
                System.out.println("  Added product " + extractJsonValue(resp, "name"));
            } else {
                System.out.println("  Failed to add product");
            }
        }

        System.out.println("Data seeding complete!");
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
