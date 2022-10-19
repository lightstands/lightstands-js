# Versioning LightStands-JS

Versioning new lightstands-js releases should follow the pattern below:

```
<API-Version>.<Internal-Version>.<Rolling-Version>
```

- `<API-Version>` is the number of API breaking. Bumping this number, means the using of old API may lead to unexpected behaviour in this version.
- `<Internal-Version>` is the number of internal breaking. Bumping the number, means the private part of this library is different from previous versions. Mixing different versions of the library may lead to unexpected behaviour.
- `<Rolling-Version>` is the rolling version number. Larger number is compatiable to smaller numbers. `0` means it's a pre-release version.
