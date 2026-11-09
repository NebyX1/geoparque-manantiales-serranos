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
            detail: `${count} fichas nuevas en tu cuaderno. Conservamos lo que ya habías guardado.`,
          }),
        );
      }}
    >
      <div>
        <span className="field-label" id="days-label">
          ¿En cuántos días querés organizarlo?
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
        <span className="field-label">¿Qué tema querés estudiar?</span>
        <select id="plan-interest" name="interest">
          <option value="nature">Agua, ambientes y biodiversidad</option>
          <option value="geology">Rocas e historia de la Tierra</option>
          <option value="culture">Patrimonio y formas de habitar</option>
          <option value="family">Observación y aprendizaje compartido</option>
          <option value="adventure">Relieve y lectura del paisaje</option>
        </select>
      </label>
      <button className="btn lime" type="submit">
        Preparar mi cuaderno
        <Icon name="arrow" />
      </button>
      <p className="planner-privacy">
        La selección es una propuesta de estudio. Confirmá los accesos si organizás trabajo de
        campo.
      </p>
    </form>
  );
}
