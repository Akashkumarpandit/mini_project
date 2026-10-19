package com.example.auth.service;

import com.example.auth.dto.MessageRequest;
import com.example.auth.entity.Listing;
import com.example.auth.entity.Message;
import com.example.auth.entity.User;
import com.example.auth.repository.ListingRepository;
import com.example.auth.repository.MessageRepository;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Message> getInbox(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        if (user.getRoles().contains("ADMIN")) {
            return messageRepository.findAll();
        }
        return messageRepository.findByReceiverOrderByCreatedAtDesc(user);
    }

    public List<Message> getSent(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return messageRepository.findBySenderOrderByCreatedAtDesc(user);
    }

    @Transactional
    public Message sendMessage(MessageRequest req, String senderUsername) {
        Message message = new Message();
        message.setMessageText(req.getMessageText());
        message.setSubject(req.getSubject());
        message.setSenderEmail(req.getSenderEmail());
        message.setSenderPhone(req.getSenderPhone());
        message.setMessageType(req.getMessageType() != null ? req.getMessageType() : "ENQUIRY");
        message.setViewingDate(req.getViewingDate());
        message.setStatus("NEW");

        if (senderUsername != null) {
            userRepository.findByUsername(senderUsername).ifPresent(u -> {
                message.setSender(u);
                if (message.getSenderEmail() == null) message.setSenderEmail(u.getEmail());
            });
        }

        if (req.getListingId() != null) {
            Listing listing = listingRepository.findById(req.getListingId()).orElse(null);
            if (listing != null) {
                message.setListing(listing);
                if (listing.getOwner() != null) {
                    message.setReceiver(listing.getOwner());
                }
            }
        }

        if (message.getReceiver() == null && req.getReceiverId() != null) {
            userRepository.findById(req.getReceiverId()).ifPresent(message::setReceiver);
        }

        return messageRepository.save(message);
    }

    @Transactional
    public Message markAsRead(Long messageId, String username) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found: " + messageId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (message.getReceiver() != null && !message.getReceiver().getId().equals(user.getId()) && !user.getRoles().contains("ADMIN")) {
            throw new AccessDeniedException("You are not authorized to modify this message.");
        }

        message.setRead(true);
        return messageRepository.save(message);
    }

    @Transactional
    public Message updateStatus(Long messageId, String status, String username) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found: " + messageId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (message.getReceiver() != null && !message.getReceiver().getId().equals(user.getId()) && !user.getRoles().contains("ADMIN")) {
            throw new AccessDeniedException("You are not authorized to update lead status.");
        }

        message.setStatus(status.toUpperCase());
        return messageRepository.save(message);
    }
}
