-- CreateTable
CREATE TABLE "cloud_boxes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,
    "container_name" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "ssh_host" TEXT NOT NULL,
    "ssh_port" INTEGER NOT NULL,
    "web_port" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "public_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATING',
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "cloud_boxes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cloud_boxes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "cloud_boxes_order_id_key" ON "cloud_boxes"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "cloud_boxes_container_name_key" ON "cloud_boxes"("container_name");

-- CreateIndex
CREATE UNIQUE INDEX "cloud_boxes_ssh_port_key" ON "cloud_boxes"("ssh_port");

-- CreateIndex
CREATE UNIQUE INDEX "cloud_boxes_web_port_key" ON "cloud_boxes"("web_port");
