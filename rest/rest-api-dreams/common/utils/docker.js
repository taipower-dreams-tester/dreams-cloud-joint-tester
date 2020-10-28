const { readFile } = require('fs');
const { promisify } = require('util');
const { Docker } = require('node-docker-api');
const { getContainerIdMatchPattern } = require('../../server/constant');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const readFilePromise = promisify(readFile);

/* $ cat /proc/self/cgroup
13:rdma:/
12:pids:/docker/8b4faee59bb91b1f4e78f33f6e03b39ccf0bf3c154de4180e08db4ef8240a9b8
11:hugetlb:/docker/8b4faee59bb91b1f4e78f33f6e03b39ccf0bf3c154de4180e08db4ef8240a9b8
10:net_prio:/docker/8b4faee59bb91b1f4e78f33f6e03b39ccf0bf3c154de4180e08db4ef8240a9b8
9:perf_event:/docker/8b4faee59bb91b1f4e78f33f6e03b39ccf0bf3c154de4180e08db4ef8240a9b8
8:net_cls:/docker/8b4faee59bb91b1f4e78f33f6e03b39ccf0bf3c154de4180e08db4ef8240a9b8
7:freezer:/docker/8b4faee59bb91b1f4e78f33f6e03b39ccf0bf3c154de4180e08db4ef8240a9b8
6:devices:/docker/8b4faee59bb91b1f4e78f33f6e03b39ccf0bf3c154de4180e08db4ef8240a9b8
5:memory:/docker/8b4faee59bb91b1f4e78f33f6e03b39ccf0bf3c154de4180e08db4ef8240a9b8
4:blkio:/docker/8b4faee59bb91b1f4e78f33f6e03b39ccf0bf3c154de4180e08db4ef8240a9b8
3:cpuacct:/docker/8b4faee59bb91b1f4e78f33f6e03b39ccf0bf3c154de4180e08db4ef8240a9b8
2:cpu:/docker/8b4faee59bb91b1f4e78f33f6e03b39ccf0bf3c154de4180e08db4ef8240a9b8
1:cpuset:/docker/8b4faee59bb91b1f4e78f33f6e03b39ccf0bf3c154de4180e08db4ef8240a9b8
0::/
*/
async function getMyId() {
  const data = await readFilePromise('/proc/self/cgroup', { encoding: 'ascii' });
  const [, id] = data.split('\n').filter(line => line.includes('docker'))[0].match(getContainerIdMatchPattern());
  return id;
}

async function getContainerById(id) {
  const containers = await docker.container.list();
  const filtered = containers.filter(continer => continer.id == id);
  if (filtered.length) {
    return filtered[0];
  } else {
    return undefined;
  }
}

async function getService(name) {
  const self = await getContainerById(await getMyId());
  const project = self.data.Labels['com.docker.compose.project'];
  const containers = await docker.container.list({ all: true });
  const filtered = containers.filter(c => (c.data.Labels['com.docker.compose.project'] == project && c.data.Labels['com.docker.compose.service'] == name));
  if (filtered.length) {
    return filtered[0];
  } else {
    return undefined;
  }
}

const promisifyStream = stream => new Promise((resolve, reject) => {
  const listOfData = [];
  stream.on('data', data => { listOfData.push(data); });
  stream.on('end', () => { resolve(listOfData); });
  stream.on('error', reject);
});

async function execInsideContainer(container, command) {
  const exec = await container.exec.create({
    AttachStdout: true,
    AttachStderr: true,
    Cmd: command,
  });
  const stream = await exec.start({ Detach: false });
  return promisifyStream(stream);
}

module.exports = {
  getMyId,
  getContainerById,
  getService,
  execInsideContainer,
};
