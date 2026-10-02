import { planTrip } from '../../features/trip/planner';
import { addTripItems } from '../../features/trip/store';
import { Icon } from './Icon';
export function TripPlanner() {
  return (
    <form
      className="planner-form"
      id="planner-form"
      onSubmit={(event) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        const count = addTripItems(
          planTrip(String(values.get('interest')), Number(values.get('days'))),
        );
        window.dispatchEvent(new CustomEvent('geopark:open-trip'));
        window.dispatchEvent(
          new CustomEvent('geopark:toast', {
            detail: `${count} lugares nuevos en tu viaje. Conservamos lo que ya habías guardado.`,
          }),
        );
      }}
    >
      <div>
        <span className="field-label" id="days-label">
          ¿Cuánto tiempo tenés?
        </span>
        <div className="plan-options" role="radiogroup" aria-labelledby="days-label">
          {['Un día', 'Dos días', 'Tres días'].map((label, index) => (
            <label className="plan-choice" key={label}>
              <input name="days" type="radio" value={index + 1} defaultChecked={index === 0} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
      <label>
        <span className="field-label">¿Qué te gustaría descubrir?</span>
        <select id="plan-interest" name="interest">
          <option value="nature">Agua, bosque y naturaleza</option>
          <option value="geology">Piedra y tiempo geológico</option>
          <option value="culture">Cultura, arquitectura y sabores</option>
          <option value="family">Una salida para compartir en familia</option>
          <option value="adventure">Caminatas y aventura acompañada</option>
        </select>
      </label>
      <button className="btn lime" type="submit">
        Armá mi escapada
        <Icon name="arrow" />
      </button>
      <p className="planner-privacy">
        Tu escapada, a tu ritmo. Después podés ordenar los lugares y elegir los días.
      </p>
    </form>
  );
}
