-- 002_trigger_timestamps_estudiante.sql
-- Trigger para mantener created_at y updated_at en ESTUDIANTE

-- Asegúrate de que la tabla ESTUDIANTE tiene columnas:
-- created_at TIMESTAMP, updated_at TIMESTAMP

create or replace trigger trg_audit_timestamps_estudiante before
   insert or update on estudiante
   for each row
begin
   if inserting then
      if :new.created_at is null then
         :new.created_at := systimestamp;
      end if;
      :new.updated_at := systimestamp;
   elsif updating then
      :new.updated_at := systimestamp;
   end if;
end;
/