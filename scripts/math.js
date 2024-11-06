export class Mat4 {
	constructor() {
		this.data = new Float32Array(16);
	}

	identity() {
		this.data.fill(0);
		this.data[0] = 1;
		this.data[5] = 1;
		this.data[10] = 1;
		this.data[15] = 1;

		return this;
	}

	perspective(fov, aspect, near, far) {
		const f = 1.0 / Math.tan(fov / 2);
		const nf = 1 / (near - far);

		this.data[0] = f / aspect;
		this.data[5] = f;
		this.data[10] = (far + near) * nf;
		this.data[11] = -1;
		this.data[14] = 2 * far * near * nf;
		this.data[15] = 0;
	}

	lookAt(eye, target, up) {
		const z = new Vec3(eye.x - target.x, eye.y - target.y, eye.z - target.z).normalize();
		const x = new Vec3(up.y * z.z - up.z * z.y, up.z * z.x - up.x * z.z, up.x * z.y - up.y * z.x).normalize();
		const y = new Vec3(z.y * x.z - z.z * x.y, z.z * x.x - z.x * x.z, z.x * x.y - z.y * x.x).normalize();

		this.data[0] = x.x;
		this.data[1] = y.x;
		this.data[2] = z.x;
		this.data[3] = 0;

		this.data[4] = x.y;
		this.data[5] = y.y;
		this.data[6] = z.y;
		this.data[7] = 0;

		this.data[8] = x.z;
		this.data[9] = y.z;
		this.data[10] = z.z;
		this.data[11] = 0;

		this.data[12] = -x.x * eye.x - x.y * eye.y - x.z * eye.z;
		this.data[13] = -y.x * eye.x - y.y * eye.y - y.z * eye.z;
		this.data[14] = -z.x * eye.x - z.y * eye.y - z.z * eye.z;
		this.data[15] = 1;
	}

	multiply(a, b) {
		const a00 = a.data[0], a01 = a.data[1], a02 = a.data[2], a03 = a.data[3];
		const a10 = a.data[4], a11 = a.data[5], a12 = a.data[6], a13 = a.data[7];
		const a20 = a.data[8], a21 = a.data[9], a22 = a.data[10], a23 = a.data[11];
		const a30 = a.data[12], a31 = a.data[13], a32 = a.data[14], a33 = a.data[15];

		const b00 = b.data[0], b01 = b.data[1], b02 = b.data[2], b03 = b.data[3];
		const b10 = b.data[4], b11 = b.data[5], b12 = b.data[6], b13 = b.data[7];
		const b20 = b.data[8], b21 = b.data[9], b22 = b.data[10], b23 = b.data[11];
		const b30 = b.data[12], b31 = b.data[13], b32 = b.data[14], b33 = b.data[15];

		this.data[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
		this.data[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
		this.data[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
		this.data[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;

		this.data[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
		this.data[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
		this.data[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
		this.data[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;

		this.data[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
		this.data[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
		this.data[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
		this.data[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;

		this.data[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
		this.data[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
		this.data[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
		this.data[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

		return this;
	}

	translate(x, y, z) {
		this.data[12] = x;
		this.data[13] = y;
		this.data[14] = z;
	}
}

export class Vec3 {
	constructor(x, y, z) {
		this.set(x, y, z);
	}

	set(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;

		return this;
	}

	normalize() {
		const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
		
		if (length !== 0) {
			this.x /= length;
			this.y /= length;
			this.z /= length;
		}

		return this;
	}
}

export class Vec2 {
	constructor(x, y) {
		this.set(x, y);
	}

	set(x, y) {
		this.x = x;
		this.y = y;
	}
}

export function degToRad(degrees) {
	return degrees * Math.PI / 180;
}
