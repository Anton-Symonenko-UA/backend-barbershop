-- AlterTable
ALTER TABLE "Barber" ADD COLUMN     "experienceSince" INTEGER,
ADD COLUMN     "specialty" TEXT;

-- AlterTable: existing rows get a random hash, so their manage links simply never match
ALTER TABLE "Booking" ADD COLUMN     "manageTokenHash" TEXT,
ADD COLUMN     "reminderSentAt" TIMESTAMP(3);
UPDATE "Booking" SET "manageTokenHash" = md5(random()::text || id) WHERE "manageTokenHash" IS NULL;
ALTER TABLE "Booking" ALTER COLUMN "manageTokenHash" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_manageTokenHash_key" ON "Booking"("manageTokenHash");

-- CreateIndex
CREATE INDEX "Booking_status_startsAt_idx" ON "Booking"("status", "startsAt");

-- No double booking, enforced by the database itself: active bookings of one barber
-- cannot overlap. Half-open ranges [start, end) let back-to-back slots touch.
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_no_overlap"
  EXCLUDE USING gist ("barberId" WITH =, tsrange("startsAt", "endsAt", '[)') WITH &&)
  WHERE ("status" IN ('PENDING', 'CONFIRMED'));

-- Sanity checks the API also validates
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_time_order" CHECK ("endsAt" > "startsAt");
ALTER TABLE "WorkingHours" ADD CONSTRAINT "WorkingHours_range" CHECK ("weekday" BETWEEN 0 AND 6 AND "startMin" >= 0 AND "endMin" <= 1440 AND "startMin" < "endMin");
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_range" CHECK ("rating" BETWEEN 1 AND 5);
