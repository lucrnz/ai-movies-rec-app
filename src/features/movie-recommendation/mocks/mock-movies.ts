import type { RecommendedMovie } from "@/features/movie-recommendation/schemas/sse-events";

export const mockMovies: RecommendedMovie[] = [
  {
    id: 27205,
    title: "Inception",
    reason:
      "Explores simulated realities and mind-bending action, questioning perception like The Matrix.",
    posterUrl: "/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
    overview:
      "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
    releaseYear: "2010",
  },
  {
    id: 9323,
    title: "Ghost in the Shell",
    reason:
      "Cyberpunk themes of human-machine interfaces and identity in a dystopia, akin to The Matrix.",
    posterUrl: "/9gC88zYUBARRSThcG93MvW14sqx.jpg",
    overview:
      "In the year 2029, the barriers of our world have been broken down by the net and by cybernetics, but this brings new vulnerability to humans in the form of brain-hacking. When a highly-wanted hacker known as 'The Puppetmaster' begins involving them in politics, Section 9, a group of cybernetically enhanced cops, are called in to investigate and stop the Puppetmaster.",
    releaseYear: "1995",
  },
  {
    id: 2666,
    title: "Dark City",
    reason:
      "Controlled artificial world with memory manipulation and uncovering truths, similar to The Matrix.",
    posterUrl: "/tNPEGju4DpTdbhBphNmZoEi9Bd3.jpg",
    overview:
      "A man struggles with memories of his past, including a wife he cannot remember, in a nightmarish world with no sun and run by beings with telekinetic powers who seek the souls of humans.",
    releaseYear: "1998",
  },
  {
    id: 1946,
    title: "eXistenZ",
    reason:
      "Virtual reality blurring real and simulated, with philosophical undertones like The Matrix.",
    posterUrl: "/kETKF0JhdTPn1knci8CAdYL0d79.jpg",
    overview:
      "A game designer on the run from assassins must play her latest virtual reality creation with a marketing trainee to determine if the game has been damaged.",
    releaseYear: "1999",
  },
  {
    id: 861,
    title: "Total Recall",
    reason:
      "Implanted memories and rebellion against oppression in sci-fi, echoing The Matrix's themes.",
    posterUrl: "/wVbeL6fkbTKSmNfalj4VoAUUqJv.jpg",
    overview:
      "Construction worker Douglas Quaid's obsession with the planet Mars leads him to visit Recall, a company that manufactures memories. When his memory implant goes wrong, Doug can no longer be sure what is and isn't reality.",
    releaseYear: "1990",
  },
];
