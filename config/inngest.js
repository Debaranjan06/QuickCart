import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

export const inngest = new Inngest({ id: "quickcart-next" });

/* ================================
   ✅ Create User
================================ */
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    if (!email_addresses || email_addresses.length === 0) {
      return { success: false, message: "No email found" };
    }

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      image_url: image_url || "",
    };

    await User.findByIdAndUpdate(id, userData, {
      upsert: true,   // prevents duplicate crash
      new: true,
    });

    return { success: true };
  }
);


/* ================================
   ✅ Update User
================================ */
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    await connectDB();

    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    if (!email_addresses || email_addresses.length === 0) {
      return { success: false, message: "No email found" };
    }

    const userData = {
      email: email_addresses[0].email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      image_url: image_url || "",
    };

    await User.findByIdAndUpdate(id, userData, { new: true });

    return { success: true };
  }
);


/* ================================
   ✅ Delete User
================================ */
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;

    await User.findByIdAndDelete(id);

    return { success: true };
  }
);
