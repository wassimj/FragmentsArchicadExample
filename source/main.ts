import * as THREE from 'three';
import * as OBC from '@thatopen/components';
import * as FRAGS from '@thatopen/fragments';

class ProgressBar
{
	progressDiv: HTMLElement;

	constructor ()
	{
		this.progressDiv = document.getElementById ('progress')!;
		this.progressDiv.style.display = 'inherit';
	}

	SetText (text: string)
	{
		this.progressDiv.innerHTML = text;
	}

	Hide ()
	{
		this.progressDiv.style.display = 'none';
	}
}

const progressBar = new ProgressBar ();
progressBar.SetText ('Downloading model...');

const components = new OBC.Components ();
components.init ();

const worlds = components.get (OBC.Worlds);
const world = worlds.create<OBC.SimpleScene, OBC.SimpleCamera, OBC.SimpleRenderer> ();

world.scene = new OBC.SimpleScene (components);
world.scene.setup ();
world.scene.three.background = null;

const container = document.getElementById ('container')!;
world.renderer = new OBC.SimpleRenderer (components, container);

world.camera = new OBC.SimpleCamera (components);
world.camera.controls.setLookAt (86, 86, 41, 23, 38, -14);

const grids = components.get (OBC.Grids);
grids.create (world);

const workerUrl = 'https://cdn.jsdelivr.net/npm/@thatopen/fragments@3.0.6/dist/Worker/worker.mjs';
const fetchedWorker = await fetch (workerUrl);
const workerText = await fetchedWorker.text ();
const workerFile = new File ([new Blob([workerText])], 'worker.mjs', {
	type: 'text/javascript',
});
const workerObjectUrl = URL.createObjectURL (workerFile);

const fragments = new FRAGS.FragmentsModels (workerObjectUrl);
world.camera.controls.addEventListener ('rest', () => fragments.update ());
world.camera.controls.addEventListener ('update', () => fragments.update ());
fragments.models.list.onItemSet.add (({ value: model }) => {
	//model.useCamera (world.camera.three);
	world.scene.three.add (model.object);
	fragments.update (true);
});

const file = await fetch ('stacked_towers.frag');
progressBar.SetText ('Loading model...');

const buffer = await file.arrayBuffer ();
const model = await fragments.load (buffer, { modelId: 'example' });
progressBar.Hide ();

model.object.addEventListener ('childadded', (ev : any) => {
	let child : THREE.Mesh = ev.child as THREE.Mesh;
	let materialArr = child.material as THREE.Material[];
	for (let material of materialArr) {
		material.side = THREE.DoubleSide;
	}
});

const mouse = new THREE.Vector2 ();
container.addEventListener ('click', async (event) => {
	
});
