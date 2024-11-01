# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.13.1

################################################################################
# Sử dụng image node chính thức cho tất cả các giai đoạn.
FROM node:${NODE_VERSION}-alpine as base

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

################################################################################
# Stage để cài đặt dependencies cho production
FROM base AS deps

# Sử dụng cơ chế cache mount để tăng tốc độ cài đặt dependencies
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

################################################################################
# Stage để build ứng dụng
FROM deps AS build

# Cài đặt cả các devDependencies và build ứng dụng
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build ứng dụng NestJS
RUN npm run build

################################################################################
# Stage cuối cùng để chạy ứng dụng với minimal runtime dependencies
FROM base AS final

# Thiết lập môi trường production
ENV NODE_ENV=production

# Chạy ứng dụng bằng quyền non-root
USER node

# Copy file package.json để có thể sử dụng các lệnh npm
COPY package.json .

# Copy các dependencies từ giai đoạn deps và mã nguồn đã build từ giai đoạn build
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Mở cổng cho ứng dụng
EXPOSE 5000

# Chạy ứng dụng ở chế độ production
CMD ["npm", "run", "start:prod"]
