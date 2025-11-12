-- 003_trigger_audit_estudiante.sql
-- Trigger de auditoría para INSERT/UPDATE/DELETE en ESTUDIANTE
-- Inserta registro en AUDIT_LOG con operación y pk

create or replace trigger trg_audit_estudiante after
   insert or update or delete on estudiante
   for each row
declare
   v_op varchar2(10);
   v_pk varchar2(4000);
begin
   if inserting then
      v_op := 'INSERT';
      v_pk := to_char(:new.id_estudiante);
   elsif updating then
      v_op := 'UPDATE';
      v_pk := to_char(nvl(
         :new.id_estudiante,
         :old.id_estudiante
      ));
   elsif deleting then
      v_op := 'DELETE';
      v_pk := to_char(:old.id_estudiante);
   end if;

   insert into audit_log (
      table_name,
      operation,
      pk_value,
      changed_by,
      details
   ) values ( 'ESTUDIANTE',
              v_op,
              v_pk,
              sys_context(
                 'USERENV',
                 'SESSION_USER'
              ),
              null );
end;
/