import { db } from "./connection";
import { folders, files } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create root folders
    const rootFolders = [
      { name: "Documents", path: "Documents" },
      { name: "Pictures", path: "Pictures" },
      { name: "Downloads", path: "Downloads" },
      { name: "Desktop", path: "Desktop" },
    ];

    const createdRootFolders = [];
    for (const folder of rootFolders) {
      const created = await db.insert(folders).values(folder).returning();
      createdRootFolders.push(created[0]);
      console.log(`✅ Created root folder: ${created[0].name}`);
    }

    // Create subfolders
    const subFolders = [
      // Documents subfolders
      { name: "Work", parentId: createdRootFolders[0].id, path: "Documents/Work" },
      { name: "Personal", parentId: createdRootFolders[0].id, path: "Documents/Personal" },
      { name: "Projects", parentId: createdRootFolders[0].id, path: "Documents/Projects" },
      
      // Pictures subfolders
      { name: "Vacation", parentId: createdRootFolders[1].id, path: "Pictures/Vacation" },
      { name: "Family", parentId: createdRootFolders[1].id, path: "Pictures/Family" },
      { name: "Screenshots", parentId: createdRootFolders[1].id, path: "Pictures/Screenshots" },
      
      // Downloads subfolders
      { name: "Software", parentId: createdRootFolders[2].id, path: "Downloads/Software" },
      { name: "Documents", parentId: createdRootFolders[2].id, path: "Downloads/Documents" },
      
      // Desktop subfolders
      { name: "Shortcuts", parentId: createdRootFolders[3].id, path: "Desktop/Shortcuts" },
    ];

    const createdSubFolders = [];
    for (const folder of subFolders) {
      const created = await db.insert(folders).values(folder).returning();
      createdSubFolders.push(created[0]);
      console.log(`✅ Created subfolder: ${created[0].name} in ${created[0].path}`);
    }

    // Create deeper nested folders
    const deepFolders = [
      // Work subfolders
      { name: "Reports", parentId: createdSubFolders[0].id, path: "Documents/Work/Reports" },
      { name: "Presentations", parentId: createdSubFolders[0].id, path: "Documents/Work/Presentations" },
      
      // Projects subfolders
      { name: "Web Development", parentId: createdSubFolders[2].id, path: "Documents/Projects/Web Development" },
      { name: "Mobile Apps", parentId: createdSubFolders[2].id, path: "Documents/Projects/Mobile Apps" },
      
      // Vacation subfolders
      { name: "2024", parentId: createdSubFolders[3].id, path: "Pictures/Vacation/2024" },
      { name: "2023", parentId: createdSubFolders[3].id, path: "Pictures/Vacation/2023" },
    ];

    const createdDeepFolders = [];
    for (const folder of deepFolders) {
      const created = await db.insert(folders).values(folder).returning();
      createdDeepFolders.push(created[0]);
      console.log(`✅ Created deep folder: ${created[0].name} in ${created[0].path}`);
    }

    // Create some sample files
    const sampleFiles = [
      // Files in Work/Reports
      { name: "quarterly-report.pdf", folderId: createdDeepFolders[0].id, size: 2048000, extension: "pdf", path: "Documents/Work/Reports/quarterly-report.pdf" },
      { name: "annual-summary.docx", folderId: createdDeepFolders[0].id, size: 1024000, extension: "docx", path: "Documents/Work/Reports/annual-summary.docx" },
      
      // Files in Work/Presentations
      { name: "project-overview.pptx", folderId: createdDeepFolders[1].id, size: 5120000, extension: "pptx", path: "Documents/Work/Presentations/project-overview.pptx" },
      
      // Files in Web Development
      { name: "index.html", folderId: createdDeepFolders[2].id, size: 4096, extension: "html", path: "Documents/Projects/Web Development/index.html" },
      { name: "style.css", folderId: createdDeepFolders[2].id, size: 2048, extension: "css", path: "Documents/Projects/Web Development/style.css" },
      { name: "script.js", folderId: createdDeepFolders[2].id, size: 8192, extension: "js", path: "Documents/Projects/Web Development/script.js" },
      
      // Files in Pictures/Family
      { name: "family-photo.jpg", folderId: createdSubFolders[4].id, size: 3145728, extension: "jpg", path: "Pictures/Family/family-photo.jpg" },
      { name: "birthday-party.png", folderId: createdSubFolders[4].id, size: 2097152, extension: "png", path: "Pictures/Family/birthday-party.png" },
      
      // Files in Downloads
      { name: "installer.exe", folderId: createdSubFolders[6].id, size: 52428800, extension: "exe", path: "Downloads/Software/installer.exe" },
      { name: "readme.txt", folderId: createdSubFolders[7].id, size: 1024, extension: "txt", path: "Downloads/Documents/readme.txt" },
    ];

    for (const file of sampleFiles) {
      const created = await db.insert(files).values(file).returning();
      console.log(`✅ Created file: ${created[0].name} in ${created[0].path}`);
    }

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
