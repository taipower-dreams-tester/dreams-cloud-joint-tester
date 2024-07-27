const { readFile } = require('fs');
const { promisify } = require('util');
const { Docker } = require('node-docker-api');
const { getContainerIdMatchPattern } = require('../../server/constant');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const readFilePromise = promisify(readFile);

/*
$ cat /proc/self/mountinfo

...
1019 1015 0:146 / /dev/mqueue rw,nosuid,nodev,noexec,relatime - mqueue mqueue rw
1020 1015 0:161 / /dev/shm rw,nosuid,nodev,noexec,relatime - tmpfs shm rw,size=65536k
1021 1013 0:35 /docker/volumes/dreams-cloud-joint-tester_loopback_storage/_data /storage rw,noatime master:57 - btrfs /dev/vdb1 rw,nodatasum,nodatacow,ssd,discard,space_cache=v2,subvolid=5,subvol=/
1024 1013 0:35 /docker/containers/b440d6f0687511d7fd6e6b581d01e03ad6d94403e41d6d6e922917377132265f/resolv.conf /etc/resolv.conf rw,noatime - btrfs /dev/vdb1 rw,nodatasum,nodatacow,ssd,discard,space_cache=v2,subvolid=5,subvol=/
1025 1013 0:35 /docker/containers/b440d6f0687511d7fd6e6b581d01e03ad6d94403e41d6d6e922917377132265f/hostname /etc/hostname rw,noatime - btrfs /dev/vdb1 rw,nodatasum,nodatacow,ssd,discard,space_cache=v2,subvolid=5,subvol=/
1026 1013 0:35 /docker/containers/b440d6f0687511d7fd6e6b581d01e03ad6d94403e41d6d6e922917377132265f/hosts /etc/hosts rw,noatime - btrfs /dev/vdb1 rw,nodatasum,nodatacow,ssd,discard,space_cache=v2,subvolid=5,subvol=/
1027 1013 0:47 /docker.sock /run/docker.sock rw,nosuid,nodev,relatime - tmpfs none rw,mode=755
733 1014 0:147 /bus /proc/bus ro,nosuid,nodev,noexec,relatime - proc proc rw
...
*/
async function getMyId() {
  const data = await readFilePromise('/proc/self/mountinfo', { encoding: 'ascii' });
  const lines = data.split('\n');
  for (let line of lines) {
    const matches = line.match(/\/docker\/containers\/(.+?)\//);
    if (matches) {
      return matches[1];
    }
  }
  throw new Error('Could not find container id');
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
