// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      header: {
        appName: "Carhoot",
        gameOptions: "Game Options",
        normalMode: "Hard Mode",
        normalModeM: "Normal Mode",
        hardMode: "Hard Mode",
        multiplayer: "Local Multiplayer",
        close: "Close",
        info: "?",
        changeLanguage: "Change language"
      },
      game: {
        // Títulos y mensajes principales
        title: "Guess the Car",
        noVehicleTitle: "No vehicle available today",
        noVehicleMessage: "We're sorry, there's no vehicle to guess today.",
        noVehicleSubmessage: "Please try again later or tomorrow.",
        loading: "Loading vehicle of the day...",
        
        // Placeholders de inputs
        marcaPlaceholder: "Enter the brand (e.g., BMW, Mercedes)",
        modeloPlaceholder: "Enter the model (e.g., Mustang, SL Class)",
        anoPlaceholder: "Enter the year",
        
        // Botones y acciones
        guessButton: "Guess",
        hintButtonTitle: "Get a hint",
        privacyPolicy: "Privacy Policy",
        attempts: "Attempts",
        
        // Etiquetas de resultados
        brand: "Brand",
        model: "Model", 
        year: "Year",
        
        // Mensajes de éxito
        congratulations: "Congratulations! You have correctly guessed the vehicle of the day.",
        
        // Alt text para imágenes
        vehicleImageAlt: "Vehicle of the day"
      },
      gameOverModal: {
        title: "Out of attempts!",
        message: "You've used all 9 attempts. What would you like to do?",
        hint: "If you see the result, you won't be able to keep playing until tomorrow.",
        continueButton: "Continue in normal mode",
        showResultButton: "View result"
      },
      confirmationModal: {
        title: "Confirmation",
        message: "Are you sure you want to see the result? You won't be able to keep playing until tomorrow.",
        cancelButton: "Cancel",
        showResultButton: "View result"
      },
      resultModal: {
        title: "Game Result",
        progress: "Your progress:",
        notGuessed: "Not guessed",
        completed: "Completed correctly!",
        goToNormalButton: "Go to normal mode"
      },
      multiplayer: {
        // Modal de configuración
        playerSetup: "Player Setup",
        playerConfiguration: "Player Configuration",
        player1: "Player 1",
        player2: "Player 2",
        nameHint: "(Name or alias)",
        startGame: "Start Game",
        back: "Back",
        
        // Indicador de turno
        turnOf: "Turn of:",
        
        // Placeholders específicos del multijugador
        brandPlaceholder: "Enter the brand",
        modelPlaceholder: "Enter the model",
        yearPlaceholder: "Enter the year",
        brandGuessed: "Brand already guessed",
        modelGuessed: "Model already guessed",
        yearGuessed: "Year already guessed",
        
        // Mensajes de puntuación
        correctBrand: "Correct brand! +10pts",
        correctModel: "Correct model! +30pts",
        correctYear: "Correct year! +30pts",
        
        // Modal de ganador
        gameCompleted: "Game Completed!",
        finalResults: "Final Results",
        points: "points",
        winner: "🏆 Winner",
        backToHome: "Back to Home",
        
        // Rondas
        round: "Round",
        
        // Loading
        loadingVehicles: "Loading vehicles of the day...",
        
        // Alt text
        vehicleAlt: "Vehicle {{number}} of the day"
      },
      howToPlay: {
        title: "How to Play",
        hardMode: "(Hard Mode)",
        multiplayerMode: "(Multiplayer)",
        goodLuck: "Good luck! 🚗💨",
        
        images: {
          title: "Images",
          description: "You have four images available, but at the beginning you can only see one. Each time you make a mistake, a new image will be unlocked until all are shown."
        },
        
        normal: {
          objective: "The objective of the game is to guess the brand, model and year of a car from images.",
          step1: "1. Guess the brand: Write the name of the brand to which the car belongs.",
          step2: {
            title: "2. Guess the model: If you get the brand right, now you must write the car model.",
            description: "For brands like BMW or Mercedes-Benz, it's not necessary to specify the engine model. Instead, indicate the corresponding series or class, such as \"3 Series\" for BMW or \"C-Class\", \"E-Class\", \"SL-Class\" for Mercedes."
          },
          step3: "3. Guess the year: Once you have guessed the model correctly, try to discover the year of manufacture."
        },
        
        hard: {
          objective: "Hard Mode: In this mode, the challenge is greater as you must guess the brand, model and year with a limit of 9 attempts.",
          step1: "1. Guess the brand: As in normal mode, but with less margin for error.",
          step2: "2. Guess the exact model: You must specify the exact version of the model.",
          step3: "3. Guess the year: You must get the exact year of the vehicle."
        },
        
        multiplayer: {
          objective: "Multiplayer Mode: Compete against friends to see who guesses the car fastest.",
          round1: "In round 1, player 1 always starts: Guessing the brand gives the least points, then the model and year give more points but the same amount.",
          round2: "In round 2, player 2 always starts: This way both players will have the facility to guess the brand which is the easiest.",
          round3: "In round 3, the player with the most points starts: At this point, guessing the brand is eliminated so that no one has any advantage and the tiebreaker is passed to the two most difficult fields.",
          winCondition: "The player who guesses correctly fastest wins",
          note: "Note: In this mode, the exact rules may vary depending on what the game creator decides."
        },
        
        hints: {
          title: "Hints",
          description: "If you fail 5 times, a hint button will be activated that will show you a letter of the correct answer."
        },
        
        yearHelp: {
          title: "Year Help",
          description: "When you try to guess the year, the color of the attempts will indicate if you are close or far:",
          red: "Red/Orange → Very far from the correct year.",
          yellow: "Yellow → You're getting closer.",
          green: "Green → Very close!"
        }
      },
      hintModal: {
        title: "Hint Revealed",
        revealedLetters: "Revealed letters",
        attemptsRemaining: "Attempts remaining for next letter"
      },
      privacyPolicy: {
        title: "Privacy Policy",
        cookiesTitle: "Cookies and Tracking Technologies",
        cookiesDescription: "This site uses cookies and similar tracking technologies to improve user experience and provide a more relevant advertising environment. Cookies are essential for measuring advertising effectiveness and ensuring a robust online advertising industry.",
        cookiesUsage: "We use a proprietary cookie to store the user's game progress, allowing them to continue from where they left off on subsequent visits. Additionally, our advertising partners may use unique identifiers stored in cookies to improve ad personalization and compatibility in browsers like iOS and macOS.",
        advertisingTitle: "Advertising Preferences",
        advertisingDescription: "Some ads on our site may be based on your browsing activity and may use tracking technologies to display relevant content. These advertising cookies enable a better experience tailored to each user's interests.",
        euUsersNotice: "FOR EU USERS: By using our site, certain preselected companies may access and use information from your device to display personalized ads.",
        updatesTitle: "Policy Updates",
        updatesDescription: "This privacy policy may be updated occasionally. Any changes will be reflected on this page.",
        acceptButton: "Accept"
      }
    }
  },
  es: {
    translation: {
      header: {
        appName: "Carhoot",
        gameOptions: "Opciones de Juego",
        normalMode: "Modo Difícil",
        normalModeM: "Modo Normal",
        hardMode: "Modo Difícil",
        multiplayer: "Multijugador Local",
        close: "Cerrar",
        info: "?",
        changeLanguage: "Cambiar idioma"
      },
      game: {
        // Títulos y mensajes principales
        title: "Adivina el Coche",
        noVehicleTitle: "No hay vehículo del día disponible",
        noVehicleMessage: "Lo sentimos, hoy no hay ningún vehículo para adivinar.",
        noVehicleSubmessage: "Por favor, vuelve a intentarlo más tarde o mañana.",
        loading: "Cargando vehículo del día...",
        
        // Placeholders de inputs
        marcaPlaceholder: "Introduce la marca (ej: BMW, Mercedes)",
        modeloPlaceholder: "Introduce el modelo (ej: Mustang, SL Class)",
        anoPlaceholder: "Introduce el año",
        
        // Botones y acciones
        guessButton: "Adivinar",
        hintButtonTitle: "Obtener pista",
        privacyPolicy: "Política de Privacidad",
        attempts: "Intentos",
        
        // Etiquetas de resultados
        brand: "Marca",
        model: "Modelo",
        year: "Año",
        
        // Mensajes de éxito
        congratulations: "¡Felicidades! Has adivinado correctamente el vehículo del día.",
        
        // Alt text para imágenes
        vehicleImageAlt: "Vehículo del día"
      },
      gameOverModal: {
        title: "¡Se acabaron los intentos!",
        message: "Has agotado tus 9 intentos. ¿Qué deseas hacer?",
        hint: "Si ves el resultado, no podrás seguir jugando hasta mañana.",
        continueButton: "Continuar en modo normal",
        showResultButton: "Ver resultado"
      },
      confirmationModal: {
        title: "Confirmación",
        message: "¿Estás seguro de que quieres ver el resultado? No podrás seguir jugando hasta mañana.",
        cancelButton: "Cancelar",
        showResultButton: "Ver resultado"
      },
      resultModal: {
        title: "Resultado del Juego",
        progress: "Tu progreso:",
        notGuessed: "No adivinado",
        completed: "¡Completado correctamente!",
        goToNormalButton: "Ir al modo normal"
      },
      multiplayer: {
        // Modal de configuración
        playerSetup: "Configuración de Jugadores",
        playerConfiguration: "Configuración de Jugadores",
        player1: "Jugador 1",
        player2: "Jugador 2",
        nameHint: "(Nombre o alias)",
        startGame: "Comenzar Partida",
        back: "Volver",
        
        // Indicador de turno
        turnOf: "Turno de:",
        
        // Placeholders específicos del multijugador
        brandPlaceholder: "Introduce la marca",
        modelPlaceholder: "Introduce el modelo",
        yearPlaceholder: "Introduce el año",
        brandGuessed: "Marca ya adivinada",
        modelGuessed: "Modelo ya adivinado",
        yearGuessed: "Año ya adivinado",
        
        // Mensajes de puntuación
        correctBrand: "¡Marca correcta! +10pts",
        correctModel: "¡Modelo correcto! +30pts",
        correctYear: "¡Año correcto! +30pts",
        
        // Modal de ganador
        gameCompleted: "¡Juego Completado!",
        finalResults: "Resultados Finales",
        points: "puntos",
        winner: "🏆 Ganador",
        backToHome: "Volver al Inicio",
        
        // Rondas
        round: "Ronda",
        
        // Loading
        loadingVehicles: "Cargando vehículos del día...",
        
        // Alt text
        vehicleAlt: "Vehículo {{number}} del día"
      },
      howToPlay: {
        title: "Cómo Jugar",
        hardMode: "(Modo Difícil)",
        multiplayerMode: "(Multijugador)",
        goodLuck: "¡Buena suerte! 🚗💨",
        
        images: {
          title: "Imágenes",
          description: "Tienes cuatro imágenes disponibles, pero al inicio solo podrás ver una. Cada vez que cometas un error, se desbloqueará una nueva imagen hasta que se muestren todas."
        },
        
        normal: {
          objective: "El objetivo del juego es adivinar la marca, el modelo y el año de un coche a partir de imágenes.",
          step1: "1. Adivina la marca: Escribe el nombre de la marca a la que pertenece el coche.",
          step2: {
            title: "2. Adivina el modelo: Si aciertas la marca, ahora debes escribir el modelo del coche.",
            description: "Para marcas como BMW o Mercedes-Benz, no es necesario especificar el modelo de motor. En su lugar, indica la serie o clase correspondiente, como \"Serie 3\" en BMW o \"C-Class\", \"E-Class\", \"SL-Class\" en Mercedes."
          },
          step3: "3. Adivina el año: Una vez que hayas acertado el modelo, intenta descubrir el año de fabricación."
        },
        
        hard: {
          objective: "Modo Difícil: En este modo, el desafío es mayor ya que deberás adivinar la marca, modelo y año con un límite de 9 Intentos del coche.",
          step1: "1. Adivina la marca: Como en el modo normal, pero con menos margen de error.",
          step2: "2. Adivina el modelo exacto: Debes especificar la versión exacta del modelo.",
          step3: "3. Adivina el año: Deberás acertar el año exacto del vehículo."
        },
        
        multiplayer: {
          objective: "Modo Multijugador: Compite contra amigos para ver quién adivina el coche más rápido.",
          round1: "En la ronda 1 siempre comienza el jugador 1: Adivinar la marca es lo que menos puntuación da luego el modelo y el año dan más puntos pero dan la misma cantidad.",
          round2: "En la ronda 2 siempre comienza el jugador 2: De este modo ambos jugadores tendrán la facilidad para adivinar la marca que es lo más sencillo.",
          round3: "En la ronda 3 comenzará el jugador con más puntos: Llegados a este punto se elimina el adivinar la marca para que no se tenga ninguna ventaja y se pasa el desempate a los dos campos más difíciles.",
          winCondition: "Gana el jugador que adivine correctamente más rápido",
          note: "Nota: En este modo, las reglas exactas pueden variar según lo que decida el creador del juego."
        },
        
        hints: {
          title: "Pistas",
          description: "Si fallas 5 veces, se activará un botón de pista que te mostrará una letra de la respuesta correcta."
        },
        
        yearHelp: {
          title: "Ayuda para el año",
          description: "Cuando intentes adivinar el año, el color de los intentos te indicará si estás cerca o lejos:",
          red: "Rojo/Naranja → Muy lejos del año correcto.",
          yellow: "Amarillo → Te estás acercando.",
          green: "Verde → ¡Muy cerca!"
        }
      },
      hintModal: {
        title: "Pista Revelada",
        revealedLetters: "Letras reveladas",
        attemptsRemaining: "Intentos restantes para próxima letra"
      },
      privacyPolicy: {
        title: "Política de Privacidad",
        cookiesTitle: "Cookies y Tecnologías de Seguimiento",
        cookiesDescription: "Este sitio utiliza cookies y tecnologías de seguimiento similares para mejorar la experiencia del usuario y ofrecer un entorno publicitario más relevante. Las cookies son esenciales para medir la efectividad de la publicidad y garantizar una industria publicitaria en línea sólida.",
        cookiesUsage: "Utilizamos una cookie propia para almacenar el progreso del usuario en el juego, permitiéndole continuar desde donde lo dejó en visitas posteriores. Además, nuestros socios publicitarios pueden utilizar identificadores únicos almacenados en cookies para mejorar la personalización de anuncios y la compatibilidad en navegadores como iOS y macOS.",
        advertisingTitle: "Preferencias de Publicidad",
        advertisingDescription: "Algunos anuncios en nuestro sitio pueden estar basados en su actividad de navegación y pueden utilizar tecnologías de seguimiento para mostrar contenido relevante. Estas cookies publicitarias permiten una mejor experiencia adaptada a los intereses de cada usuario.",
        euUsersNotice: "PARA USUARIOS EN LA UE: Al utilizar nuestro sitio, ciertas empresas preseleccionadas pueden acceder y utilizar información de su dispositivo para mostrar anuncios personalizados.",
        updatesTitle: "Actualización de la Política",
        updatesDescription: "Esta política de privacidad puede actualizarse ocasionalmente. Cualquier cambio será reflejado en esta página.",
        acceptButton: "Aceptar"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    debug: false,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;