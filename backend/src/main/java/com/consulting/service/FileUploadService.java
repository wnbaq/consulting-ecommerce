package com.consulting.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public String uploadImage(MultipartFile file, String subfolder) throws IOException {
        String extension = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "." + extension;

        Path dir = Paths.get(uploadDir, subfolder);
        Files.createDirectories(dir);

        Path target = dir.resolve(filename);
        file.transferTo(target);

        return baseUrl + "/uploads/" + subfolder + "/" + filename;
    }

    public String saveFromBytes(byte[] bytes, String subfolder, String extension) throws IOException {
        String filename = UUID.randomUUID() + "." + extension;

        Path dir = Paths.get(uploadDir, subfolder);
        Files.createDirectories(dir);

        Files.write(dir.resolve(filename), bytes);

        return baseUrl + "/uploads/" + subfolder + "/" + filename;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
