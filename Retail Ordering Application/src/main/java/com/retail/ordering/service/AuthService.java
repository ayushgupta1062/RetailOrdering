package src.main.java.com.retail.ordering.service;

import com.retail.ordering.config.JwtUtil;
import com.retail.ordering.dto.LoginRequest;
import com.retail.ordering.dto.RegisterRequest;
import com.retail.ordering.model.User;
import com.retail.ordering.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;


@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;


    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }


        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // BCrypt hash
                .role("USER")         // All new registrations get USER role by default
                .loyaltyPoints(0)
                .build();


        return userRepository.save(user);
    }


    public Map<String, String> login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));


        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }


        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());


        Map<String, String> result = new HashMap<>();
        result.put("token", token);
        result.put("role", user.getRole());
        result.put("name", user.getName());
        result.put("email", user.getEmail());
        return result;
    }
}
