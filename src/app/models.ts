export interface Training {
  id: string;
  team: Team;
  name: string;
  startedAt: Date;
  stoppedAt: Date;
  duration: number;
  status: TrainingStatus;
  players: Player[];
  currentSession?: Session;
  sessions?: Session[];
}

export interface Session {
  id: string;
  name: string;
  startedAt: string;
  stoppedAt: string;
  duration: number;
}

export interface Team {
  id: string;
  description: string;
  name: string; // dasherized - only for routing use

  users?: User[];
  players: Player[];
}

/**
 * Dashboard portal user model
 */
export interface User {
  id?: string;
  name: string;
  surname: string;
  email: string;
  role: UserRole;
  password?: string;
  language?: string;

  team?: Team;
}

export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Trainer = 'Trainer',
  Player = 'Player',
}

export const RoleNumber = new Map<string, number>([
  [UserRole.SuperAdmin, 0],
  [UserRole.Trainer, 1],
  [UserRole.Player, 2],
]);

export interface Player {
  id: string;
  name: string;
  surname: string;
  number: string;
  age: string;
  height: string;
  weight: string;
  role: PlayerRole;
  team: Team;

  device?: Device;
}

export enum PlayerRole {
  Goalkeeper = 'Goalkeeper',
  Defender = 'Defender',
  Midfielder = 'Midfielder',
  Forward = 'Forward',
}

export const PlayerRoleLabel = new Map<string, string>([
  [PlayerRole.Goalkeeper, 'player.role.goalkeeper'],
  [PlayerRole.Defender, 'player.role.defender'],
  [PlayerRole.Midfielder, 'player.role.midfielder'],
  [PlayerRole.Forward, 'player.role.forward'],
]);

export interface Device {
  id: string;
  status: DeviceStatus;
  batteryStatus: DeviceBatteryStatus;
  player?: Player;
}
export enum DeviceBatteryStatus {
  Charged = 'Charged',
  Charging = 'Charging',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Drained = 'Drained',
}

export const DeviceBatteryStatusLabel = new Map<string, string>([
  [DeviceBatteryStatus.Charged, 'device.batteryStatus.fullyCharged'],
  [DeviceBatteryStatus.Charging, 'device.batteryStatus.charging'],
  [DeviceBatteryStatus.High, 'device.batteryStatus.high'],
  [DeviceBatteryStatus.Medium, 'device.batteryStatus.medium'],
  [DeviceBatteryStatus.Low, 'device.batteryStatus.low'],
  [DeviceBatteryStatus.Drained, 'device.batteryStatus.drained'],
]);

export enum DeviceStatus {
  Active = 'Active',
  Disabled = 'Disabled',
  WeakSignal = 'WeakSignal',
  Available = 'Available',
  Incompleted = 'Incompleted',
  Searching = 'Searching',
}

export const DeviceStatusLabel = new Map<DeviceStatus, string>([
  [DeviceStatus.Active, 'device.status.active'],
  [DeviceStatus.Disabled, 'device.status.disabled'],
  [DeviceStatus.WeakSignal, 'device.status.weakSignal'],
  [DeviceStatus.Available, 'device.status.available'],
  [DeviceStatus.Incompleted, 'device.status.incompleted'],
  [DeviceStatus.Searching, 'device.status.searching'],
]);

export enum TrainingStatus {
  Running = 'Running',
  Paused = 'Paused',
  Stopped = 'Stopped',
}

export const TrainingStatusLabel = new Map<TrainingStatus, string>([
  [TrainingStatus.Running, 'training.status.running'],
  [TrainingStatus.Paused, 'training.status.paused'],
  [TrainingStatus.Stopped, 'training.status.stopped'],
]);
