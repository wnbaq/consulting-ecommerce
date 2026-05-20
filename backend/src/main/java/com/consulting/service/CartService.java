package com.consulting.service;

import com.consulting.dto.cart.CartItemRequest;
import com.consulting.dto.cart.CartResponse;
import com.consulting.entity.*;
import com.consulting.exception.BusinessException;
import com.consulting.exception.ResourceNotFoundException;
import com.consulting.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ConsultingServiceRepository serviceRepository;
    private final ServicePackageRepository packageRepository;

    public CartResponse getCart(User user) {
        Cart cart = getOrCreateCart(user);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(User user, CartItemRequest request) {
        Cart cart = getOrCreateCart(user);

        BigDecimal unitPrice;
        ConsultingService service = null;
        ServicePackage pkg = null;
        String name;

        if (request.getItemType() == CartItem.ItemType.SERVICE) {
            if (request.getServiceId() == null) throw new BusinessException("Service ID is required");
            service = serviceRepository.findById(request.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
            unitPrice = service.getPrice();
            name = service.getTitle();
        } else {
            if (request.getPackageId() == null) throw new BusinessException("Package ID is required");
            pkg = packageRepository.findById(request.getPackageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Package not found"));
            unitPrice = pkg.getPrice();
            name = pkg.getName();
        }

        CartItem item = CartItem.builder()
                .cart(cart)
                .service(service)
                .servicePackage(pkg)
                .itemType(request.getItemType())
                .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                .unitPrice(unitPrice)
                .build();

        cart.getItems().add(item);
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse removeItem(User user, Long itemId) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BusinessException("This item does not belong to you");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public void clearCart(User user) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });
    }

    public Cart getRawCart(User user) {
        return getOrCreateCart(user);
    }

    private CartResponse toResponse(Cart cart) {
        List<CartResponse.CartItemResponse> items = cart.getItems().stream()
                .map(item -> {
                    String name = item.getItemType() == CartItem.ItemType.SERVICE
                            ? item.getService().getTitle()
                            : item.getServicePackage().getName();

                    BigDecimal subtotal = item.getUnitPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));

                    return CartResponse.CartItemResponse.builder()
                            .id(item.getId())
                            .name(name)
                            .itemType(item.getItemType().name())
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .subtotal(subtotal)
                            .serviceId(item.getService() != null ? item.getService().getId() : null)
                            .packageId(item.getServicePackage() != null ? item.getServicePackage().getId() : null)
                            .build();
                }).toList();

        BigDecimal total = items.stream()
                .map(CartResponse.CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .items(items)
                .total(total)
                .build();
    }
}
