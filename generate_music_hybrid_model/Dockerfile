# GENERATE_MUSIC_HYBRID_MODEL — container image
#
# The repo's variant contract requires a Dockerfile per variant (ssm-lambda-variant skill, read this
# session). This worker is small enough to ship as a zip, and the zip path is what `build_zip.sh`
# produces; this image exists so the variant is COMPLETE rather than half-migrated (the skill's own
# words: "never half-migrate"), and so the same package can be deployed either way.
#
# THE ONE NON-OBVIOUS STEP, and it is the whole point: the shared contract package `music_studio/`
# (param_spec.json + its data files + models/planner/mastering/per_gate/g2p) is COPIED IN. It is not
# vendored by hand and not duplicated: there is exactly one copy in the repository and the build
# takes it. If it is missing at runtime the worker fails LOUDLY on import rather than accepting a
# single request with no contract (fail-open here would be the unwired class).
FROM public.ecr.aws/lambda/python:3.12

COPY requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install --no-cache-dir -r ${LAMBDA_TASK_ROOT}/requirements.txt

COPY lambda_function.py models.py config.py ${LAMBDA_TASK_ROOT}/
COPY music_studio/ ${LAMBDA_TASK_ROOT}/music_studio/

# Import-time proof that the contract document travelled with the code: the build fails here rather
# than at the first customer request if param_spec.json or a data file is absent.
RUN python -c "import sys; sys.path.insert(0, '${LAMBDA_TASK_ROOT}'); \
from music_studio import models as m; s = m.load_spec(); \
print('param_spec parameters:', len(s['parameters'])); \
assert len(s['parameters']) >= 34, 'param_spec.json is truncated or wrong'"

CMD ["lambda_function.lambda_handler"]
