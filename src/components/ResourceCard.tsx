import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, Film as FilmIcon, Bug, Car, Rocket, ExternalLink } from "lucide-react";
import { ExpandableBadge } from "./ExpandableBadge";
import {
  type ResourceType,
  type Person,
  type Planet,
  type Film,
  type Species,
  type Vehicle,
  type Starship,
} from "@/lib/api";

export const resourceIcons: Record<ResourceType, React.ReactNode> = {
  people: <Users className="w-4 h-4" />,
  planets: <Globe className="w-4 h-4" />,
  films: <FilmIcon className="w-4 h-4" />,
  species: <Bug className="w-4 h-4" />,
  vehicles: <Car className="w-4 h-4" />,
  starships: <Rocket className="w-4 h-4" />,
};

interface CardProps<T> {
  disableBadges?: boolean;
  onViewFull?: () => void;
}

function PersonCard({ person, disableBadges = false, onViewFull }: CardProps<Person> & { person: Person }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-yellow-500" />
          {person.name}
          {onViewFull && (
            <button onClick={onViewFull} className="text-muted-foreground hover:text-foreground transition-colors" title="View full details">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </CardTitle>
        <CardDescription>{person.gender} - {person.birth_year}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">Height:</span> {person.height}cm</div>
          <div><span className="text-muted-foreground">Mass:</span> {person.mass}kg</div>
          <div><span className="text-muted-foreground">Hair:</span> {person.hair_color}</div>
          <div><span className="text-muted-foreground">Eyes:</span> {person.eye_color}</div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <ExpandableBadge urls={person.films} label="films" disabled={disableBadges} />
          <ExpandableBadge urls={person.starships} label="starships" disabled={disableBadges} />
          <ExpandableBadge urls={person.vehicles} label="vehicles" disabled={disableBadges} />
        </div>
      </CardContent>
    </Card>
  );
}

function PlanetCard({ planet, disableBadges = false, onViewFull }: CardProps<Planet> & { planet: Planet }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" />
          {planet.name}
          {onViewFull && (
            <button onClick={onViewFull} className="text-muted-foreground hover:text-foreground transition-colors" title="View full details">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </CardTitle>
        <CardDescription>{planet.climate} climate</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">Terrain:</span> {planet.terrain}</div>
          <div><span className="text-muted-foreground">Population:</span> {planet.population}</div>
          <div><span className="text-muted-foreground">Diameter:</span> {planet.diameter}km</div>
          <div><span className="text-muted-foreground">Gravity:</span> {planet.gravity}</div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <ExpandableBadge urls={planet.residents} label="residents" disabled={disableBadges} />
          <ExpandableBadge urls={planet.films} label="films" disabled={disableBadges} />
        </div>
      </CardContent>
    </Card>
  );
}

function FilmCard({ film, disableBadges = false, onViewFull }: CardProps<Film> & { film: Film }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <FilmIcon className="w-5 h-5 text-red-500" />
          {film.title}
          {onViewFull && (
            <button onClick={onViewFull} className="text-muted-foreground hover:text-foreground transition-colors" title="View full details">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </CardTitle>
        <CardDescription>Episode {film.episode_id} - {film.release_date}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-2">
          <span className="text-muted-foreground">Director:</span> {film.director}
        </div>
        <div className="text-sm mb-2">
          <span className="text-muted-foreground">Producer:</span> {film.producer}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{film.opening_crawl}</p>
        <div className="flex flex-wrap gap-2">
          <ExpandableBadge urls={film.characters} label="characters" disabled={disableBadges} />
          <ExpandableBadge urls={film.planets} label="planets" disabled={disableBadges} />
          <ExpandableBadge urls={film.starships} label="starships" disabled={disableBadges} />
        </div>
      </CardContent>
    </Card>
  );
}

function SpeciesCard({ species, disableBadges = false, onViewFull }: CardProps<Species> & { species: Species }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-green-500" />
          {species.name}
          {onViewFull && (
            <button onClick={onViewFull} className="text-muted-foreground hover:text-foreground transition-colors" title="View full details">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </CardTitle>
        <CardDescription>{species.classification} - {species.designation}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">Avg Height:</span> {species.average_height}cm</div>
          <div><span className="text-muted-foreground">Lifespan:</span> {species.average_lifespan}yrs</div>
          <div><span className="text-muted-foreground">Language:</span> {species.language}</div>
          <div><span className="text-muted-foreground">Eyes:</span> {species.eye_colors}</div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <ExpandableBadge urls={species.people} label="people" disabled={disableBadges} />
          <ExpandableBadge urls={species.films} label="films" disabled={disableBadges} />
        </div>
      </CardContent>
    </Card>
  );
}

function VehicleCard({ vehicle, disableBadges = false, onViewFull }: CardProps<Vehicle> & { vehicle: Vehicle }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5 text-orange-500" />
          {vehicle.name}
          {onViewFull && (
            <button onClick={onViewFull} className="text-muted-foreground hover:text-foreground transition-colors" title="View full details">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </CardTitle>
        <CardDescription>{vehicle.model}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">Class:</span> {vehicle.vehicle_class}</div>
          <div><span className="text-muted-foreground">Manufacturer:</span> {vehicle.manufacturer}</div>
          <div><span className="text-muted-foreground">Cost:</span> {vehicle.cost_in_credits} credits</div>
          <div><span className="text-muted-foreground">Max Speed:</span> {vehicle.max_atmosphering_speed}</div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline">{vehicle.crew} crew</Badge>
          <Badge variant="outline">{vehicle.passengers} passengers</Badge>
          <ExpandableBadge urls={vehicle.pilots} label="pilots" disabled={disableBadges} />
          <ExpandableBadge urls={vehicle.films} label="films" disabled={disableBadges} />
        </div>
      </CardContent>
    </Card>
  );
}

function StarshipCard({ starship, disableBadges = false, onViewFull }: CardProps<Starship> & { starship: Starship }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-purple-500" />
          {starship.name}
          {onViewFull && (
            <button onClick={onViewFull} className="text-muted-foreground hover:text-foreground transition-colors" title="View full details">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </CardTitle>
        <CardDescription>{starship.model}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">Class:</span> {starship.starship_class}</div>
          <div><span className="text-muted-foreground">Hyperdrive:</span> {starship.hyperdrive_rating}</div>
          <div><span className="text-muted-foreground">Cost:</span> {starship.cost_in_credits} credits</div>
          <div><span className="text-muted-foreground">MGLT:</span> {starship.MGLT}</div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline">{starship.crew} crew</Badge>
          <Badge variant="outline">{starship.passengers} passengers</Badge>
          <ExpandableBadge urls={starship.pilots} label="pilots" disabled={disableBadges} />
          <ExpandableBadge urls={starship.films} label="films" disabled={disableBadges} />
        </div>
      </CardContent>
    </Card>
  );
}

interface ResourceCardProps {
  resource: unknown;
  type: ResourceType;
  disableBadges?: boolean;
  onViewFull?: () => void;
}

export function ResourceCard({ resource, type, disableBadges = false, onViewFull }: ResourceCardProps) {
  switch (type) {
    case "people":
      return <PersonCard person={resource as Person} disableBadges={disableBadges} onViewFull={onViewFull} />;
    case "planets":
      return <PlanetCard planet={resource as Planet} disableBadges={disableBadges} onViewFull={onViewFull} />;
    case "films":
      return <FilmCard film={resource as Film} disableBadges={disableBadges} onViewFull={onViewFull} />;
    case "species":
      return <SpeciesCard species={resource as Species} disableBadges={disableBadges} onViewFull={onViewFull} />;
    case "vehicles":
      return <VehicleCard vehicle={resource as Vehicle} disableBadges={disableBadges} onViewFull={onViewFull} />;
    case "starships":
      return <StarshipCard starship={resource as Starship} disableBadges={disableBadges} onViewFull={onViewFull} />;
  }
}
