/**
 * Textos compartits pels panells de gestió (coordinador i super admin):
 * rols, gestió de membres, importació des d'un full de càlcul i classes.
 */
import { defineMessages } from "../index";

export const panelsMessages = defineMessages({
  // Rols
  roleAlumne: { ca: "Alumne", es: "Alumno/a", en: "Student" },
  roleDocent: { ca: "Docent", es: "Docente", en: "Teacher" },
  roleCoordinador: {
    ca: "Coordinador",
    es: "Coordinador/a",
    en: "Coordinator",
  },

  // Comuns
  loading: { ca: "Carregant...", es: "Cargando...", en: "Loading..." },
  save: { ca: "Desa", es: "Guardar", en: "Save" },
  saved: { ca: "Desat!", es: "¡Guardado!", en: "Saved!" },
  cancel: { ca: "Cancel·la", es: "Cancelar", en: "Cancel" },
  close: { ca: "Tanca", es: "Cerrar", en: "Close" },
  wall: { ca: "Mur", es: "Muro", en: "Wall" },
  you: { ca: "tu", es: "tú", en: "you" },
  unknownError: {
    ca: "error desconegut",
    es: "error desconocido",
    en: "unknown error",
  },
  needLogin: {
    ca: "Cal iniciar sessió per veure aquest panell.",
    es: "Debes iniciar sesión para ver este panel.",
    en: "You need to sign in to see this panel.",
  },
  restricted: {
    ca: "Accés restringit",
    es: "Acceso restringido",
    en: "Restricted access",
  },
  backToStudio: {
    ca: "Torna a l'estudi",
    es: "Volver al estudio",
    en: "Back to the studio",
  },

  // Membres
  membersTitle: {
    ca: "Persones del centre",
    es: "Personas del centro",
    en: "People in the school",
  },
  membersIntro: {
    ca: "Canvia el rol de cada persona amb el desplegable o treu-la del centre. Per afegir algú, escriu el seu correu: si ja ha entrat amb Google s'aplica a l'instant; si no, quedarà pendent fins que entri per primer cop.",
    es: "Cambia el rol de cada persona con el desplegable o quítala del centro. Para añadir a alguien, escribe su correo: si ya ha entrado con Google se aplica al instante; si no, quedará pendiente hasta que entre por primera vez.",
    en: "Change each person's role with the dropdown or remove them from the school. To add someone, type their email: if they have already signed in with Google it applies right away; otherwise it stays pending until their first sign-in.",
  },
  emailPlaceholder: {
    ca: "nom@escola.org",
    es: "nombre@escuela.org",
    en: "name@school.org",
  },
  addButton: { ca: "Afegeix", es: "Añadir", en: "Add" },
  addedUpdated: {
    ca: "{email} ja té el rol de {role}.",
    es: "{email} ya tiene el rol de {role}.",
    en: "{email} now has the role {role}.",
  },
  addedInvited: {
    ca: "{email} encara no ha entrat mai: quedarà com a {role} el primer cop que iniciï sessió amb Google.",
    es: "{email} aún no ha entrado nunca: será {role} la primera vez que inicie sesión con Google.",
    en: "{email} has not signed in yet: they will become {role} the first time they sign in with Google.",
  },
  noMembers: {
    ca: "Encara no hi ha cap persona vinculada al centre.",
    es: "Aún no hay ninguna persona vinculada al centro.",
    en: "No one is linked to this school yet.",
  },
  colPerson: { ca: "Persona", es: "Persona", en: "Person" },
  colClass: { ca: "Classe", es: "Clase", en: "Class" },
  colRole: { ca: "Rol", es: "Rol", en: "Role" },
  noClass: { ca: "Sense classe", es: "Sin clase", en: "No class" },
  removeMember: {
    ca: "Treu del centre",
    es: "Quitar del centro",
    en: "Remove from school",
  },
  removeConfirmTitle: {
    ca: "Treure {email} del centre?",
    es: "¿Quitar a {email} del centro?",
    en: "Remove {email} from the school?",
  },
  removeConfirmText: {
    ca: "Deixarà de tenir escola, classe i permisos (tornarà a ser alumne sense classe). El seu compte i els seus pòdcasts no s'esborren.",
    es: "Dejará de tener centro, clase y permisos (volverá a ser alumno sin clase). Su cuenta y sus pódcasts no se borran.",
    en: "They will lose their school, class and permissions (back to a student with no class). Their account and podcasts are not deleted.",
  },
  pendingTitle: {
    ca: "Pendents d'entrar per primer cop ({count})",
    es: "Pendientes de entrar por primera vez ({count})",
    en: "Waiting for first sign-in ({count})",
  },
  pendingHint: {
    ca: "Se'ls aplicarà el rol, l'escola i la classe automàticament quan iniciïn sessió amb Google amb aquest correu.",
    es: "Se les aplicará el rol, el centro y la clase automáticamente cuando inicien sesión con Google con este correo.",
    en: "Role, school and class will be applied automatically when they sign in with Google using this email.",
  },
  deleteInvite: { ca: "Anul·la", es: "Anular", en: "Cancel" },
  filterPlaceholder: {
    ca: "Cerca per nom, correu o classe",
    es: "Buscar por nombre, correo o clase",
    en: "Search by name, email or class",
  },

  // Importació
  importTitle: {
    ca: "Importa alumnes i docents (Excel o CSV)",
    es: "Importar alumnos y docentes (Excel o CSV)",
    en: "Import students and teachers (Excel or CSV)",
  },
  importIntro: {
    ca: "Puja un full de càlcul amb una fila per persona i aquestes columnes: nom, correu, rol (alumne / docent / coordinador), curs i aula. Curs + aula formen la classe (p. ex. «1r ESO» + «A» → «1r ESO A»), que es crea si no existeix. Si la primera fila té els noms de les columnes, s'hi detecten sols.",
    es: "Sube una hoja de cálculo con una fila por persona y estas columnas: nombre, correo, rol (alumno / docente / coordinador), curso y aula. Curso + aula forman la clase (p. ej. «1º ESO» + «A» → «1º ESO A»), que se crea si no existe. Si la primera fila tiene los nombres de las columnas, se detectan solos.",
    en: 'Upload a spreadsheet with one row per person and these columns: name, email, role (student / teacher / coordinator), course and classroom. Course + classroom form the class (e.g. "Year 7" + "A" → "Year 7 A"), created if it does not exist. If the first row holds the column names they are detected automatically.',
  },
  chooseFile: {
    ca: "Tria un fitxer .xlsx o .csv",
    es: "Elige un archivo .xlsx o .csv",
    en: "Choose an .xlsx or .csv file",
  },
  downloadTemplate: {
    ca: "Baixa una plantilla",
    es: "Descargar una plantilla",
    en: "Download a template",
  },
  previewTitle: {
    ca: "{count} files detectades",
    es: "{count} filas detectadas",
    en: "{count} rows detected",
  },
  previewHeaderYes: {
    ca: "Capçalera detectada.",
    es: "Cabecera detectada.",
    en: "Header row detected.",
  },
  previewHeaderNo: {
    ca: "Sense capçalera: s'ha suposat l'ordre nom, correu, rol, curs, aula.",
    es: "Sin cabecera: se ha supuesto el orden nombre, correo, rol, curso, aula.",
    en: "No header row: assumed order name, email, role, course, classroom.",
  },
  previewMore: {
    ca: "... i {count} més",
    es: "... y {count} más",
    en: "... and {count} more",
  },
  colName: { ca: "Nom", es: "Nombre", en: "Name" },
  colEmail: { ca: "Correu", es: "Correo", en: "Email" },
  colCourse: { ca: "Curs", es: "Curso", en: "Course" },
  colClassroom: { ca: "Aula", es: "Aula", en: "Classroom" },
  importButton: {
    ca: "Importa {count} persones",
    es: "Importar {count} personas",
    en: "Import {count} people",
  },
  importing: { ca: "Important...", es: "Importando...", en: "Importing..." },
  importDone: {
    ca: "Importació feta",
    es: "Importación hecha",
    en: "Import complete",
  },
  resultUpdated: {
    ca: "{count} ja tenien compte i s'han actualitzat.",
    es: "{count} ya tenían cuenta y se han actualizado.",
    en: "{count} already had an account and were updated.",
  },
  resultInvited: {
    ca: "{count} quedaran assignades quan entrin per primer cop.",
    es: "{count} se asignarán cuando entren por primera vez.",
    en: "{count} will be assigned when they first sign in.",
  },
  resultClasses: {
    ca: "Classes creades: {list}",
    es: "Clases creadas: {list}",
    en: "Classes created: {list}",
  },
  resultErrors: {
    ca: "{count} files no s'han pogut importar:",
    es: "{count} filas no se han podido importar:",
    en: "{count} rows could not be imported:",
  },
  errorEmail: {
    ca: "fila {row}: correu no vàlid ({email})",
    es: "fila {row}: correo no válido ({email})",
    en: "row {row}: invalid email ({email})",
  },
  errorRole: {
    ca: "fila {row}: rol desconegut ({email})",
    es: "fila {row}: rol desconocido ({email})",
    en: "row {row}: unknown role ({email})",
  },
  parseError: {
    ca: "No s'ha pogut llegir el fitxer. Ha de ser un .xlsx o un .csv.",
    es: "No se ha podido leer el archivo. Debe ser un .xlsx o un .csv.",
    en: "Could not read the file. It must be an .xlsx or a .csv.",
  },
  noRows: {
    ca: "No s'ha trobat cap fila amb correu.",
    es: "No se ha encontrado ninguna fila con correo.",
    en: "No rows with an email address were found.",
  },
  clearFile: { ca: "Descarta", es: "Descartar", en: "Discard" },

  // Classes
  classesTitle: {
    ca: "Classes de l'escola ({count})",
    es: "Clases del centro ({count})",
    en: "School classes ({count})",
  },
  noClassesYet: {
    ca: "Encara no hi ha cap classe creada al centre. Els docents les creen des del Panell del mestre, o es creen en importar alumnes amb curs i aula.",
    es: "Aún no hay ninguna clase creada en el centro. Los docentes las crean desde el Panel del docente, o se crean al importar alumnos con curso y aula.",
    en: "No classes yet. Teachers create them from the Teacher panel, or they are created when importing students with a course and classroom.",
  },
  schoolWallBadge: { ca: "Mur escola", es: "Muro centro", en: "School wall" },
  membersCount: {
    ca: "{count} membres",
    es: "{count} miembros",
    en: "{count} members",
  },
  deleteClass: {
    ca: "Esborra la classe",
    es: "Eliminar la clase",
    en: "Delete class",
  },
  deleteClassConfirmTitle: {
    ca: "Esborrar la classe «{name}»?",
    es: "¿Eliminar la clase «{name}»?",
    en: 'Delete class "{name}"?',
  },
  deleteClassConfirmText: {
    ca: "Només es poden esborrar classes sense pòdcasts. L'alumnat en quedarà desvinculat i el codi deixarà de funcionar.",
    es: "Solo se pueden eliminar clases sin pódcasts. El alumnado quedará desvinculado y el código dejará de funcionar.",
    en: "Only classes without podcasts can be deleted. Students will be unlinked and the code will stop working.",
  },
  deleteAction: { ca: "Esborra", es: "Eliminar", en: "Delete" },
});
