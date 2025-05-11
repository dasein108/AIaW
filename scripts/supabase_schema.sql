

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."add_chat_owner_as_member"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.chat_members (chat_id, user_id)
  values (new.id, new.owner_id)
  on conflict do nothing;
  return new;
end;
$$;


ALTER FUNCTION "public"."add_chat_owner_as_member"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_profile_on_signup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.email);
  return new;
end;
$$;


ALTER FUNCTION "public"."create_profile_on_signup"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_chat_if_authorized"("chat_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  is_owner boolean;
  is_member boolean;
  chat_is_group boolean;
begin
  -- Get chat info
  select c.is_group, 
         c.owner_id = auth.uid(), 
         exists (
           select 1 
           from public.chat_members cm 
           where cm.chat_id = c.id and cm.user_id = auth.uid()
         )
  into chat_is_group, is_owner, is_member
  from public.chats c
  where c.id = chat_id;

  if not found then
    raise exception 'Chat not found';
  end if;

  if chat_is_group and not is_owner then
    raise exception 'Only the group owner can delete this chat';
  end if;

  if not chat_is_group and not is_member then
    raise exception 'Only a chat member can delete this DM chat';
  end if;

  -- Delete the chat (CASCADE will delete related members and messages)
  delete from public.chats where id = chat_id;
end;
$$;


ALTER FUNCTION "public"."delete_chat_if_authorized"("chat_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_chat_owner"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."set_chat_owner"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_sender_id"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  if new.sender_id is null then
    new.sender_id := auth.uid();
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."set_sender_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."start_private_chat_with"("target_user_id" "uuid", "current_user_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  existing_chat_id uuid;
  new_chat_id uuid;
begin
  if target_user_id = current_user_id then
    raise exception 'Cannot create private chat with yourself';
  end if;

  -- Check if chat exists
  select c.id into existing_chat_id
  from public.chats c
  join public.chat_members m1 on c.id = m1.chat_id
  join public.chat_members m2 on c.id = m2.chat_id
  where c.is_group = false 
    and c.is_public = false
    and m1.user_id = current_user_id
    and m2.user_id = target_user_id
  limit 1;

  if existing_chat_id is not null then
    return existing_chat_id;
  end if;

  insert into public.chats (is_group, is_public, owner_id)
  values (false, false, current_user_id)
  returning id into new_chat_id;

  insert into public.chat_members (chat_id, user_id)
  values (new_chat_id, current_user_id), (new_chat_id, target_user_id)
  on conflict do nothing;

  return new_chat_id;
end;
$$;


ALTER FUNCTION "public"."start_private_chat_with"("target_user_id" "uuid", "current_user_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."broadcast_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."broadcast_messages" REPLICA IDENTITY FULL;


ALTER TABLE "public"."broadcast_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_members" (
    "chat_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."chat_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "is_group" boolean DEFAULT false NOT NULL,
    "is_public" boolean,
    "owner_id" "uuid",
    "name" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."chats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chat_id" "uuid",
    "sender_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."messages" REPLICA IDENTITY FULL;


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."broadcast_messages"
    ADD CONSTRAINT "broadcast_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_members"
    ADD CONSTRAINT "chat_members_pkey" PRIMARY KEY ("chat_id", "user_id");



ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "add_chat_owner_as_member_trigger" AFTER INSERT ON "public"."chats" FOR EACH ROW EXECUTE FUNCTION "public"."add_chat_owner_as_member"();



CREATE OR REPLACE TRIGGER "set_chat_owner_trigger" BEFORE INSERT ON "public"."chats" FOR EACH ROW EXECUTE FUNCTION "public"."set_chat_owner"();

ALTER TABLE "public"."chats" ENABLE ALWAYS TRIGGER "set_chat_owner_trigger";



CREATE OR REPLACE TRIGGER "set_sender_id_trigger" BEFORE INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."set_sender_id"();

ALTER TABLE "public"."messages" ENABLE ALWAYS TRIGGER "set_sender_id_trigger";



ALTER TABLE ONLY "public"."chat_members"
    ADD CONSTRAINT "chat_members_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_members"
    ADD CONSTRAINT "chat_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can read profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create chats" ON "public"."chats" FOR INSERT WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "Authenticated users can insert broadcast messages" ON "public"."broadcast_messages" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can read broadcast messages" ON "public"."broadcast_messages" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Insert messages if user is member or chat is public" ON "public"."messages" FOR INSERT WITH CHECK ((("sender_id" = "auth"."uid"()) AND ((EXISTS ( SELECT 1
   FROM "public"."chat_members"
  WHERE (("chat_members"."chat_id" = "messages"."chat_id") AND ("chat_members"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "messages"."chat_id") AND ("chats"."is_public" = true)))))));



CREATE POLICY "Members or owner can update chat" ON "public"."chats" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."chat_members"
  WHERE (("chat_members"."chat_id" = "chats"."id") AND ("chat_members"."user_id" = "auth"."uid"())))) OR ("owner_id" = "auth"."uid"())));



CREATE POLICY "Owner can delete chat" ON "public"."chats" FOR DELETE USING (("owner_id" = "auth"."uid"()));



CREATE POLICY "Read messages if user is member or chat is public" ON "public"."messages" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."chat_members"
  WHERE (("chat_members"."chat_id" = "messages"."chat_id") AND ("chat_members"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "messages"."chat_id") AND ("chats"."is_public" = true))))));



CREATE POLICY "Read public chats, member chats, or owned chats" ON "public"."chats" FOR SELECT USING ((("is_public" = true) OR (EXISTS ( SELECT 1
   FROM "public"."chat_members"
  WHERE (("chat_members"."chat_id" = "chats"."id") AND ("chat_members"."user_id" = "auth"."uid"())))) OR ("owner_id" = "auth"."uid"())));



CREATE POLICY "Users can join group chats or their own private chats" ON "public"."chat_members" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND ((EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "chat_members"."chat_id") AND ("chats"."is_public" = true)))) OR (EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "chat_members"."chat_id") AND ("chats"."owner_id" = "auth"."uid"())))))));



CREATE POLICY "Users can join group or own private chats" ON "public"."chat_members" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "chat_members"."chat_id") AND (("chats"."is_public" = true) OR ("chats"."owner_id" = "auth"."uid"())))))));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their memberships" ON "public"."chat_members" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users or chat owners can add members" ON "public"."chat_members" FOR INSERT WITH CHECK (((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "chat_members"."chat_id") AND (("chats"."is_public" = true) OR ("chats"."owner_id" = "auth"."uid"())))))) OR (EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "chat_members"."chat_id") AND ("chats"."owner_id" = "auth"."uid"()))))));



ALTER TABLE "public"."broadcast_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."broadcast_messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."chat_members";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."chats";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."profiles";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."add_chat_owner_as_member"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_chat_owner_as_member"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_chat_owner_as_member"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_profile_on_signup"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_on_signup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_on_signup"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_chat_if_authorized"("chat_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_chat_if_authorized"("chat_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_chat_if_authorized"("chat_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_chat_owner"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_chat_owner"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_chat_owner"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_sender_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_sender_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_sender_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."start_private_chat_with"("target_user_id" "uuid", "current_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."start_private_chat_with"("target_user_id" "uuid", "current_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."start_private_chat_with"("target_user_id" "uuid", "current_user_id" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."broadcast_messages" TO "anon";
GRANT ALL ON TABLE "public"."broadcast_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."broadcast_messages" TO "service_role";



GRANT ALL ON TABLE "public"."chat_members" TO "anon";
GRANT ALL ON TABLE "public"."chat_members" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_members" TO "service_role";



GRANT ALL ON TABLE "public"."chats" TO "anon";
GRANT ALL ON TABLE "public"."chats" TO "authenticated";
GRANT ALL ON TABLE "public"."chats" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
